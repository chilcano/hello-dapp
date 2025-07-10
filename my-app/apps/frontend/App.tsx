import { useState } from 'react';
import { ethers } from 'ethers';
import contractData from './contract-address.json';

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

const CONTRACT_ADDRESS = contractData.address;
const ALCHEMY_URL_FROM_VITE = import.meta.env.VITE_ALCHEMY_SEPOLIA_URL;
const BACKEND_URL_FROM_VITE = import.meta.env.VITE_BACKEND_URL || '';

const ABI = [
  "function message() view returns (string)",
  "function setMessage(string _newMessage)",
  "event MessageUpdated(string)"
];

function App() {
  // States for wallet info
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [balanceMetaMask, setBalanceMetaMask] = useState<string | null>(null);

  // States for direct Alchemy call (insecure)
  const [balanceAlchemy, setBalanceAlchemy] = useState<string | null>(null);
  const [rpcUrlVisible, setRpcUrlVisible] = useState(false);
  const [alchemyError, setAlchemyError] = useState<string | null>(null);

  // States for backend call (secure)
  const [lastBlock, setLastBlock] = useState<number | null>(null);
  const [backendUrlVisible, setBackendUrlVisible] = useState(false);

  // States for contract info
  const [contractBalance, setContractBalance] = useState<string | null>(null);

  // States for message contract interaction
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  // States for gas price serverless API
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [gasPriceApiVisible, setGasPriceApiVisible] = useState(false);

  // Connect wallet and load current message
  const connectWalletAndLoadMessage = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request!({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        alert("No accounts found.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setUserAddress(accounts[0]);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const message = await contract.message();
      setCurrentMessage(message);
      setUpdateSuccess(false);
    } catch (error) {
      console.error("Error connecting wallet or loading message:", error);
    }
  };

  // Update message in contract
  const updateMessage = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    if (!userAddress) {
      alert("Please connect wallet first.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.setMessage(newMessage);
      await tx.wait();
      setCurrentMessage(newMessage);
      setUpdateSuccess(true);
      setNewMessage('');
    } catch (error) {
      console.error("Error updating message:", error);
      setUpdateSuccess(false);
    }
  };

  // Function to fetch balance via MetaMask
  const fetchBalanceMetaMask = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setUserAddress(address);
      setBalanceMetaMask(balanceEth);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch balance via Alchemy directly (insecure)
  const fetchBalanceAlchemy = async () => {
    setAlchemyError(null); // Reset previous error
    try {
      if (!userAddress) {
        setAlchemyError("Please connect your wallet first (MetaMask) to obtain your account address and fetch its balance.");
        setBalanceAlchemy(null);
        setRpcUrlVisible(false);
        return;
      }
      const alchemyProvider = new ethers.JsonRpcProvider(ALCHEMY_URL_FROM_VITE);
      const balanceWei = await alchemyProvider.getBalance(userAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalanceAlchemy(balanceEth);
      setRpcUrlVisible(true);
    } catch (error) {
      console.error(error);
      setAlchemyError("Error fetching balance via Alchemy.");
      setBalanceAlchemy(null);
      setRpcUrlVisible(false);
    }
  };

  // Function to fetch last block number via backend (secure)
  const fetchLastBlockBackend = async () => {
    try {
      const url = BACKEND_URL_FROM_VITE ? `${BACKEND_URL_FROM_VITE}/api/getLastBlock` : '/api/getLastBlock';
      const res = await fetch(url);
      const data = await res.json();
      setLastBlock(data.blockNumber);
      setBackendUrlVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch contract balance via Alchemy
  const fetchContractBalance = async () => {
    try {
      const alchemyProvider = new ethers.JsonRpcProvider(ALCHEMY_URL_FROM_VITE);
      const balanceWei = await alchemyProvider.getBalance(CONTRACT_ADDRESS);
      const balanceEth = ethers.formatEther(balanceWei);
      setContractBalance(balanceEth);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch gas price via serverless API
  const fetchGasPrice = async () => {
    try {
      const res = await fetch('/api/getGasPrice');
      const data = await res.json();
      setGasPrice(data.gasPrice ?? 'Not available');
      setGasPriceApiVisible(true);
    } catch {
      setGasPrice(null);
      setGasPriceApiVisible(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', maxWidth: 600 }}>
      <h1>📨 Hello dApp</h1>

      {/* Message Interaction Section */}
      <section style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 15 }}>
        <h3>📒 Use Smart Contract</h3>
        <button onClick={connectWalletAndLoadMessage} style={{ marginTop: 8, marginRight: 12 }}>
          Connect Wallet & Load Message
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type new message"
          style={{ marginRight: 8 }}
        />
        <button onClick={updateMessage}>Update Message</button>
        {updateSuccess && (
          <p style={{ color: 'green', marginTop: 8 }}>
            ✅ Message updated!
          </p>
        )}
        <p style={{ marginTop: 10, fontStyle: 'italic' }}>{currentMessage}</p>
      </section>

      {/* 1. Connected Wallet Info */}
      <section style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 15 }}>
        <h3>🔐 Connected Wallet Info</h3>
        <p><strong>Address:</strong> {userAddress || 'Not connected'}</p>
        <button onClick={fetchBalanceMetaMask}>Get Balance (via MetaMask)</button>
        {balanceMetaMask && <p>Balance: {balanceMetaMask} ETH</p>}
      </section>

      {/* 2. Call to 3rd Party Service */}
      <section style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 15 }}>
        <h3>🌐 Call to 3rd Party Service</h3>

        <div style={{ marginBottom: 10 }}>
          <button onClick={fetchBalanceAlchemy}>Get Balance (via Alchemy · insecurely)</button>
          {alchemyError && <p style={{ color: 'red' }}>{alchemyError}</p>}
          {balanceAlchemy && <p>Balance: {balanceAlchemy} ETH</p>}
          {rpcUrlVisible && (
            <p style={{ fontSize: '0.8em', color: '#555' }}>
              RPC URL: <code>{ALCHEMY_URL_FROM_VITE}</code>
            </p>
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <button onClick={fetchLastBlockBackend}>Get Last Block (via Backend · securely)</button>
          {lastBlock !== null && <p>Last Block Number: {lastBlock}</p>}
          {backendUrlVisible && (
            <p style={{ fontSize: '0.8em', color: '#555' }}>
              Backend URL: <code>/api/getLastBlock</code>
            </p>
          )}
        </div>

        {/* New gas price API */}
        <div>
          <button onClick={fetchGasPrice}>Get Gas Price (via Serverless API · securely)</button>
          {gasPrice !== null && <p>Gas Price (wei): {gasPrice}</p>}
          {gasPriceApiVisible && (
            <p style={{ fontSize: '0.8em', color: '#555' }}>
              API URL: <code>/api/getGasPrice</code>
            </p>
          )}
        </div>
      </section>

      {/* 3. Destination Contract Info */}
      <section>
        <h3>📦 Destination Contract Info (via Alchemy)</h3>
        <button onClick={fetchContractBalance}>Get Contract Balance (via Alchemy · insecurely)</button>
        {contractBalance !== null && <p>Contract Balance: {contractBalance} ETH</p>}
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: 10 }}>
          (Note: This HelloWorld contract is not payable and will always have 0 ETH unless funded externally.)
        </p>
      </section>
    </div>
  );
}

export default App;
