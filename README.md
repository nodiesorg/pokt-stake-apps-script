## POKT App Stake Script

### Description

The POKT App Stake Script is a tool designed to simplify the process of staking applications. 

### Prerequisites

- Node.js environment
- A CSV file, `app-private-keys.csv`, containing new app private keys that you intend to stake. This file should also be located in the `input` directory.

### File Format

Each CSV file should have the following format:

```
privateKey
YOUR_APP_PRIVATE_KEY_1
YOUR_APP_PRIVATE_KEY_2
...
```

Ensure that the header is labeled "privateKey" and each subsequent row contains one private key.

### Setup

1. **Clone the Repository**: Clone or download the source code to your local machine.

2. **Install Dependencies**: Navigate to the root directory of the source code in your terminal and run:

   ```bash
   npm install
   ```

3. **Install TypeScript and tsc:** If you haven't already installed TypeScript and its compiler, you can do so globally with:

   ```bash
   npm install -g typescript
   ```
   
### Usage

1. **Execution**: Simply run the following command in the root project directory and follow the prompts:

   ```bash
   npm run start
   ```

2. **Follow the prompts**:

    - You will first be prompted to enter your POKT RPC Provider URL. Enter the appropriate URL
      - For testnet we provide a complimentary testnet RPC URL: https://pokt-testnet-rpc.nodies.org
    - If everything is in order, you will receive a summary of the actions about to be performed and be asked for confirmation before proceeding.
    - If you confirm the actions, the tool will proceed to stake new app stakes.

_Note: Keep in mind that each POKT transaction costs 0.01 POKT fee. So if you are staking your entire wallet balance, account for the fee._
1 POKT = 1000000 UPOKT

3. **Check the Results**:

    - After the process is completed, you can check the results in the `output` directory. A CSV file will be generated for staked applications, detailing the success or failure of each stake tx.

---

### Example Execution
```sh
Enter your POKT RPC Provider URL: https://pokt-testnet-rpc.nodies.org
Enter the chains you wish to stake, i.e: 0007,0021,0008: 0007
Enter the amount of uPOKT you wish to stake, i.e: 100000000: 10000000000000
Is this for testnet?, i.e: yes/no: yes

App stakes count being staked: 5
RPC Provider: https://pokt-testnet-rpc.nodies.org

Does this seem correct? Confirm by typing yes: yes
Attempting to stake app:  ccd667d108882c2811ea066b00a505e5cbe096ed
Attempting to stake app:  6573be637ecef7ae283725bcf3e4b470136357bd
Attempting to stake app:  f978776fd145b7236fe899935d511a737497ddbc
Attempting to stake app:  58b026b0ae113c7bb7b2bddd59025bbd744a5ecf
Attempting to stake app:  61e04d656528a8499d35434328dc8ef97a8585f1
Results saved to {project_dir}/stake_app_script/output/2024-02-13T09_20_06.295Z-results.csv
App stakes successfully staked
```