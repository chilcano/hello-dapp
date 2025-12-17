import { ethers } from "ethers";

async function signMessage() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signature = await signer.signMessage("Hola Ethereum!");
  console.log("Firma:", signature);
}
