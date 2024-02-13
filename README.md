## POKT App Stake Rotator

### Description

The POKT App Stake Rotator is a tool designed to simplify the process of rotating POKT app stakes. Specifically, it replaces a set of old app stakes with new ones. 

### Prerequisites

- Node.js environment
- A CSV file, `old-app-private-keys.csv`, containing old app private keys that you intend to unstake. This file should be located in the `input` directory.
- A CSV file, `new-app-private-keys.csv`, containing new app private keys that you intend to stake. This file should also be located in the `input` directory.
  - **Ensure that all your new public app stakes have at least 2 POKT**

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
3. **Environment Variables**: Set up the `chainId` environment variable if it's different from the default ("mainnet").

   ```bash
   export chainId="testnet"
   ```

### Usage

1. **Execution**: Simply run the following command in the root directory:

   ```bash
   node index.js
   ```

2. **Follow the prompts**:

    - You will first be prompted to enter your POKT RPC Provider URL. Enter the appropriate URL.
    - The tool will then check for the existence and validity of the `old-app-private-keys.csv` and `new-app-private-keys.csv` files.
    - If everything is in order, you will receive a summary of the actions about to be performed and be asked for confirmation before proceeding.
    - If you confirm the actions, the tool will proceed to unstake old app stakes and stake new app stakes.

3. **Check the Results**:

    - After the process is completed, you can check the results in the `output` directory. A CSV file will be generated for both the staking and unstaking actions, detailing the success or failure of each action.

---