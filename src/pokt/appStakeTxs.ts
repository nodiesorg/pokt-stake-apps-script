import {KeyManager} from "@pokt-foundation/pocketjs-signer";
import {ChainID, TransactionBuilder} from "@pokt-foundation/pocketjs-transaction-builder";
import {getPoktProvider} from "../di";

/**
 * Tries to stake an app with retries.
 *
 * @param {string} appPrivateKey - The private key for the app.
 * @param {number} [retryAttempts=10] - The number of times to retry the action if it fails.
 * @returns {Promise<string>} The transaction hash if successful, 'Failed' otherwise.
 */
export async function appStakeRetry(appPrivateKey: string, retryAttempts = 10, testnet:boolean,  stakeAmount: string, chains: string[]): Promise<string> {
    const signer = await KeyManager.fromPrivateKey(appPrivateKey);


    const transactionBuilder = new TransactionBuilder({
        provider: getPoktProvider(),
        signer,
        chainID: testnet ? "testnet": "mainnet"
    });


    if (stakeAmount == "-1") {
        const app = await getPoktProvider().getApp({address: signer.getAddress()})
        stakeAmount = app.stakedTokens
    }

    console.log("Attempting to stake app: ", signer.getAddress());
    const actionMsg = transactionBuilder.appStake({
        appPubKey: signer.getPublicKey(),
        chains: chains,
        amount: stakeAmount
    });

    let error: any;
    for (let i = 0; i < retryAttempts; i++) {
        try {
            const response = await transactionBuilder.submit({txMsg: actionMsg});
            return response.txHash;
        } catch (e) {
            error = e;
        }
    }
    throw Error(error);
}
