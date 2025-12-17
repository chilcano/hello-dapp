// 1️⃣ Conexión básica

import { ethers } from "ethers";

// 1. Conexión al nodo (provider)
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/<API_KEY>");

// 2. Crear instancia del contrato (dirección + ABI)
const contract = new ethers.Contract(
  "<CONTRACT_ADDRESS>",                      // dirección del token en Sepolia
  ["function name() view returns (string)"], // ABI mínima (solo la función que queremos)
  provider
);

// 3. Llamada asíncrona de lectura
const main = async () => {
  const name = await contract.name();
  console.log("Token name:", name);
};
main();

// <CONTRACT_ADDRESS> = 0x6a9Bf36E0ef.......db6bC283c8E
// <API_KEY> = tu clave de Infura

// Salida esperada:
// Token name: USDC

// *******************************************++

// 2️⃣ Cambia la funcion a symbol() o totalSupply()
// Para probar otras funciones del contrato:
// symbol() → muestra el ticker del token (ej. “USDC”).
// totalSupply() → devuelve el número total de tokens (en wei).
// Sólo cambia el ABI a:
// ["function symbol() view returns (string)"]
// O cámbialo así:
// ["function totalSupply() view returns (uint256)"]