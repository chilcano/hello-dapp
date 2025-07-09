# 02 - Add HelloWorld smart contract

## 02.1. Create and deploy contract

```sh
## 1. Create a contracts/ folder inside your existing React app and initialize Hardhat
cd my-app
mkdir contracts && cd contracts
pnpm init -p
pnpm add -D hardhat
npx hardhat init

# Select "Create a basic sample project" and accept defaults

## 2. Replace the sample contract with HelloWorld.sol
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
## 3. Compile the contract
npx hardhat compile

## 4. Replace the deploy script with one for HelloWorld

## In Hardhat 2.21.0, scripts folder should be created
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
## 5. Start the Hardhat local network
npx hardhat node
```

```sh
## 6. In a second terminal, deploy the contract to localhost
cd my-app/contracts
npx hardhat run scripts/deploy.js --network localhost

HelloWorld deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```sh
## 7. Install ethers.js in your React app
cd ../
pnpm add ethers

## 8. (Optional) Connect MetaMask to localhost
# Add a network in MetaMask:
# - Network Name: Hardhat
# - RPC URL: http://localhost:8545
# - Chain ID: 31337
# Then import a Hardhat account using its private key from the terminal output
```

## 02.2. Update React app to interact with contract

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
cd my-app
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
  "event MessageUpdated(string newMessage)" // afegit per escoltar l'event
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

        // 1. Llegir el missatge actual
        const msg = await contract.message();
        setMessage(msg);

        // 2. Escoltar l'event "MessageUpdated"
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

    // 3. Cleanup per evitar múltiples subscripcions
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

### Step 3: Run the application


```sh
pnpm dev
```

### Step 4: Configure MetaMask with Local Hardhat Network and add import a Hardhat wallet

If you didn't do that, you will have next error:

> Error: could not decode result data (value="0x", info={ "method": "message", ... })


The, you should configure the right network and configure MetaMask.

- In MetaMask select the Hardhat Network
- Import Hardhat test wallets into MetaMask which have funds
- Repeat the transaction on the application and make sure MetaMask has the right network and account.

