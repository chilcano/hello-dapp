1️⃣ Interacción con el contrato

import TokenABI from "../abi/Token.json";

export async function getBalance(provider, address, contractAddress) {
  const contract = new ethers.Contract(contractAddress, TokenABI.abi, provider);
  const balance = await contract.balanceOf(address);
  return ethers.formatUnits(balance, 18);
}

🧠 Explicación:
Lectura (read call) sin gas, obtiene el balance del usuario.