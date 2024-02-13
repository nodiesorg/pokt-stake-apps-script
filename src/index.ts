import * as fs from 'fs';
import * as readline from 'readline';

import {JsonRpcProvider} from "@pokt-foundation/pocketjs-provider";

import * as Path from "path";
import {setPoktProvider} from "./di";
import {appStakeRetry} from "./pokt/appStakeTxs";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const STAKE_BATCH_SIZE = 50;

const appStakeKeys = Path.join(__dirname, "../input/app-private-keys.csv")
async function main() {
    const rpcProviderUrl = await askQuestion('Enter your POKT RPC Provider URL: ');
    const inputFiles = [appStakeKeys]
    for (const f of inputFiles) {
        if (!isValidFilePath(f)) {
            console.error(`Could not find ${f}`);
            return;
        }
    }

    const chainsStaked = (await askQuestion("Enter the chains you wish to stake, i.e: 0007,0021,0008: ")).split(",").map(s=>s.trim())
    const amountToStake = await askQuestion("Enter the amount of uPOKT you wish to stake, i.e: 100000000: ")

    const isTestnet = (await askQuestionWithExpectedOutput("Is this for testnet?, i.e: yes/no: ", ["yes", "no"])) === "yes"


    const appStakePrivateKeys = getAppPrivateKeysFromCSV(appStakeKeys);

    console.log('')
    console.log(`App stakes count being staked: ${appStakePrivateKeys.length}`)
    console.log(`RPC Provider: ${rpcProviderUrl}`)
    console.log(`Testnet: ${isTestnet}`)
    console.log(`Staked uPOKT Amount: ${amountToStake}`)
    console.log(`Staked Chains: ${chainsStaked}`)
    console.log('')

    const confirm = await askQuestion(`Does this seem correct? Confirm by typing yes: `)

    if(!["y", "yes"].includes(confirm)) {
        throw new Error(`User confirmation failed, user answered with ${confirm}`)
    }

    // Instantiate a provider for querying information on the chain!
    setPoktProvider(new JsonRpcProvider({
        rpcUrl: rpcProviderUrl,
        dispatchers: [rpcProviderUrl],
    }));

    if(!await handleBatchAppStake(appStakePrivateKeys, isTestnet, chainsStaked, amountToStake)) {
        throw new Error("Failed to stake all apps, try running the script again!")
    }

    console.log("App stakes successfully staked")
    rl.close()
}

/**
 * Handles the staking for given app private keys.
 * Processes the keys in batches and generates a CSV report of the results.
 *
 * @param {string[]} appPrivateKeys - Array of app private keys to process.
 * @param {string[]} chains - Array of chains to stake in
 * @param {boolean} testnet - flag if the transaction is for testnet chain.
 * @param {string} upokt - the amount of upokt (1 POKT = 1,000,000 upokt) to stake.
 * @returns {Promise<boolean>} Returns true if all actions are successful, false otherwise.
 */
async function handleBatchAppStake(appPrivateKeys: string[], testnet: boolean, chains: string[], upokt: string) {

    const responses: {
        address: string,
        response: string,
        success: boolean
    }[] = [];


    for (let i = 0; i < appPrivateKeys.length; i += STAKE_BATCH_SIZE) {
        const batch = appPrivateKeys.slice(i, i + STAKE_BATCH_SIZE);
        const batchResults = await Promise.allSettled(batch.map(addr => appStakeRetry(addr, 10, testnet, upokt, chains)));

        for (let j = 0; j < batchResults.length; j++) {
            const result = batchResults[j];
            if (result.status === 'fulfilled') {
                const responseValue = (result as PromiseFulfilledResult<string>).value;
                responses.push({
                    address: batch[j],
                    response: responseValue,
                    success: true,
                });
            } else {
                // promise rejected, likely from an exception
                responses.push({
                    address: batch[j],
                    response: (result as PromiseRejectedResult).reason.toString(),
                    success: false
                });
            }
        }
    }

    // Create the csv file for output
    let csvContent = 'address,response,success\n';
    for (const {address, response, success} of responses) {
        csvContent += `${address},${response},${success}\n`;
    }
    const outputFileName = `${new Date().toISOString()}-results.csv`.replace(/:/g,"_");
    const outputPath = Path.join(__dirname, "../", "output", outputFileName);
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    console.log(`Results saved to ${outputPath}`);

    return !responses.find(s=> !s.success)
}


/**
 * Prompts the user with a question and waits for the answer.
 *
 * @param {string} question - The question to ask.
 * @returns {Promise<string>} A promise that resolves to the user's answer.
 */
function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function askQuestionWithExpectedOutput(question: string, validOutputs: string[]): Promise<string> {
    const response = await askQuestion(question)
    if(!validOutputs.find(s => s === response)) {
       console.log(`Invalid input, looking for ${validOutputs} as a response`)
        return askQuestionWithExpectedOutput(question, validOutputs)
    }
    return response
}

/**
 * Checks if the given file path is valid and accessible.
 *
 * @param {string} filePath - Path to the file.
 * @returns {boolean} True if the file is accessible, otherwise false.
 */
function isValidFilePath(filePath: string): boolean {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Validates the content of a CSV containing private keys.
 *
 * @param {string[]} privateKeys - Array of strings from the CSV, where the first element is expected to be the header.
 * @returns {boolean} True if the CSV is valid, otherwise false.
 */
function isValidCsv(privateKeys: string[]): boolean {
    const header = privateKeys[0];
    if (header != "privateKey") {
        console.error('malformed addreses.csv header');
        return false;
    }
    const invalidAddresses = privateKeys.slice(1).filter(key => key.length !== 128);
    if (invalidAddresses.length > 0) {
        console.error('Invalid addresses:', invalidAddresses);
        return false;
    }
    if(privateKeys.slice(1).length > 100) {
        console.error('Avoid batch sending to more than 100 to, wait another 15 minutes and try another 100');
        return false;
    }
    return true;
}

/**
 * Extracts and validates app private keys from a CSV file.
 *
 * @param {string} filePath - Path to the CSV file.
 * @returns {string[] | undefined} Array of validated private keys, or throws an exception if the CSV is not valid.
 */
function getAppPrivateKeysFromCSV(filePath: string): string[] {
    const receiverData = fs.readFileSync(filePath, 'utf-8');
    const receiverAddressesFile = receiverData.split('\n').map(line => line.trim());

    if (!isValidCsv(receiverAddressesFile)) {
        throw new Error(`malformed CSV for app keys: ${filePath}`)
    }

    return receiverAddressesFile.slice(1);
}

main().catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
});