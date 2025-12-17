1️⃣ Instalar dependencias

cd ..
mkdir frontend && cd frontend
npm create vite@latest
# Seleccionar React + JavaScript
npm install
npm install ethers


2️⃣ Configurar hardhat.config.js

src/
 ├─ App.jsx
 ├─ components/
 │   └─ WalletConnect.jsx
 └─ abi/
     └─ Token.json


3️⃣ Conexión a MetaMask

import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) return alert("Instala MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  console.log("Wallet conectada:", address);
  return { provider, signer, address };
}

📎 Uso: Mostrar botón “Conectar Wallet” en el componente principal.
