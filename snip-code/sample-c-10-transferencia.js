1️⃣ Ejemplo de transacción (transferencia)

export async function transferTokens(signer, contractAddress, to, amount) {
  const contract = new ethers.Contract(contractAddress, TokenABI.abi, signer);
  const tx = await contract.transfer(to, ethers.parseUnits(amount, 18));
  await tx.wait();
  console.log("Transferencia completada");
}


⚙️ Write call: requiere firma y pago de gas.

