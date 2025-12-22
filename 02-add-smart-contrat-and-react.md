# 02 - Add HelloWorld smart contract

## 1. Create and deploy contract

```sh
## 1. Create a contracts/ folder inside your existing React app and initialize Hardhat
mkdir my-app/contracts && cd my-app/contracts
pnpm init -p

# Important. This project works with Hardhat 2.25.0 (latest is 3.1.0 and breaks process)
pnpm add -D hardhat@2.25.0 @nomicfoundation/hardhat-toolbox@6.0.0
npx hardhat --version
2.25.0

npx hardhat init

#? What do you want to do? … 
#▸ Create a JavaScript project
#  Create a TypeScript project
#  Create a TypeScript project (with Viem)
#  Create an empty hardhat.config.js
#  Quit

## 2. Remove Lock.sol (optional) and create new contract
rm contracts/Lock.sol
nano contracts/HelloWorld.sol
```

```ts
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HelloWorld {
    string public message = "Hello, World!";

    event MessageUpdated(string newMessage); // 👈 event definition

    function setMessage(string calldata _newMessage) public {
        message = _newMessage;
        emit MessageUpdated(_newMessage); // 👈 emit event
    }
}
```

```sh
## 3. Compile the all contracts, artifact folder will be created
npx hardhat compile

## 4. Replace the deploy script with one for HelloWorld (In Hardhat 2.25.0 the scripts folder should be created)
mkdir scripts
cat << 'EOF' > scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const hello = await HelloWorld.deploy();

  // Since Hardhat v2.20+, using @nomicfoundation/hardhat-ethers, the returned contract by getContractFactory(...).deploy() 
  // has been deployed automatically and don't have .deployed() like before.
  //await hello.deployed();

  // Get deployed address
  const address = await hello.getAddress();
  console.log("HelloWorld deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF
```

```sh
## 5. Start the Hardhat local network. It'll show a list of fake wallets with ETH to make tests
npx hardhat node
```

```sh
## 6. In a second terminal, deploy the contract to localhost
cd hello-dapp/my-app/contracts
npx hardhat run scripts/deploy.js --network localhost

HelloWorld deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

# In the previous terminal 'npx hardhat node' you should see this:
...
eth_accounts
hardhat_metadata (20)
eth_blockNumber
eth_getBlockByNumber
eth_feeHistory
eth_maxPriorityFeePerGas
eth_sendTransaction
  Contract deployment: HelloWorld
  Contract address:    0x5fbdb2315678afecb367f032d93f642f64180aa3
  Transaction:         0x7800f2401631bd7c686cedfa7718e1e83b44edc28950c823f3ab97837e7278a5
  From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value:               0 ETH
  Gas used:            445185 of 16777216
  Block #1:            0x86bf691a191f3cba2f7b95d9064c628a122f53bdaaf86c32e2ad657a5f744541
```

## 2. Update React app to interact with contract

```sh
## Interact with the contract from React
# In your React component, use ethers.js to read and write the message

# Example:
# const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
# const msg = await contract.message();
# await contract.setMessage("New Message");
```

### Step 1: Ensure ethers is installed

```sh
cd my-app/
pnpm add ethers
```

### Step 2: Replace the contents of src/App.tsx with:

```ts
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractData from './contract-address.json';

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

const CONTRACT_ADDRESS = contractData.address;

const ABI = [
  "function message() view returns (string)",
  "function setMessage(string _newMessage)",
  "event MessageUpdated(string newMessage)" // Added to listen for event. See MessageUpdated in HelloWorld.sol
];

function App() {
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);

    const init = async () => {
      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // 1. Read the current message
        const msg = await contract.message();
        setMessage(msg);

        // 2. Listen the event "MessageUpdated"
        contract.on("MessageUpdated", (newMsg: string) => {
          console.log("📢 Event received:", newMsg);
          setMessage(newMsg);
          setStatus("🔔 Message updated via event");
        });

      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();

    // 3. Cleanup to avoid multiple subscriptions
    return () => {
      provider.getSigner().then((signer) => {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        contract.removeAllListeners("MessageUpdated");
      });
    };
  }, []);

  const updateMessage = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.setMessage(newMessage);
      setStatus("⏳ Waiting for confirmation...");
      await tx.wait();
      setStatus("✅ Message updated!");
    } catch (error) {
      console.error("Update error:", error);
      setStatus("❌ Error updating message");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📨 HelloWorld Smart Contract</h1>
      <p><strong>Current message:</strong> {message}</p>
      <input
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        placeholder="Type new message"
      />
      <button onClick={updateMessage} style={{ marginLeft: 10 }}>
        Update
      </button>
      <p>{status}</p>
    </div>
  );
}

export default App;
```

### Step 3: Launch the React application

```sh
pnpm dev
```

You will have error because the `contract-address.json` file doesn't exist and should be created for `my-app/contracts/scripts/deploy.js`. So, update the `deploy.js` with this:

```js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const hello = await HelloWorld.deploy();  
  await hello.waitForDeployment();

  // Since Hardhat v2.20+, using @nomicfoundation/hardhat-ethers, the returned contract by getContractFactory(...).deploy() 
  // has been deployed automatically and don't have .deployed() like before.
  //await hello.deployed();

  // Get deployed address
  const address = await hello.getAddress();
  console.log("HelloWorld smartcontract deployed. Address: ", address);

  const deployData = { address };

  // Save in deployments/localhost.json
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  fs.mkdirSync(path.dirname(deployPath), { recursive: true });
  fs.writeFileSync(deployPath, JSON.stringify(deployData, null, 2));

  // Also copy to src/ to be used in React
  const frontendPath = path.join(__dirname, "../../src/contract-address.json");
  fs.writeFileSync(frontendPath, JSON.stringify(deployData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
Once update, deploy the contract and after that, run the React app.
```sh
cd contracts/
npx hardhat run scripts/deploy.js --network localhost
cd ..
pnpm dev
```

### Step 4: Configure MetaMask with Local Hardhat Network and add a Hardhat wallet

Be careful to approve the transaction from React application, because you **probably are using a wrong Network and wrong contract address**, before that requires be verified and updated accordingly.

Or if you get the next error, then you need to configure your MetaMask.

> Error: could not decode result data (value="0x", info={ "method": "message", ... })

Then, you should configure the right blockchain network in MetaMask and use a proper wallet address with funds to perform the transaction.

**Configure Hardhat Network in Metamask** 
1. Open MetaMask
2. Click on `Networks`
3. Click on `+ Add a custom network`
4. Add next details: 
  - Network Name: Hardhat Test
  - Default RPC URL: http://localhost:8545
  - Chain ID: 31337 (don't force to use `1337`)
  - currency symbol: GO (don't force to use `ETH`)
5. Save

**Import a Hardhat Wallet Address into MetaMask**  
1. Open MetaMask
2. Click on left-top icon `Accounts`. 
3. There, click on `Add wallet` button.
4. Select the 2nd option called `Import an account`. 
5. There you will add only one of 20 Hardhat private-key available.
6. (Important) In MetaMask make sure to use Hardhat Wallet Account with the Hardhat Local Network. Without that, when you run the React application, you maybe is sending tokens to wrong address.
