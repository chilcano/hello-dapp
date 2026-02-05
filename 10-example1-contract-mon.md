# Example 1: Monitorizar un smart contract (HelloWorld.sol)

Esta guía muestra **cómo empezar a monitorizar un contrato crítico** usando:
- Hardhat
- El JSON de deploy generado automáticamente
- Un script Node.js sencillo (sin infra compleja)

El objetivo es **detectar actividad relevante** en el contrato `HelloWorld`.

---

## 1️⃣ Contexto del contrato a monitorizar

### Smart contract (`HelloWorld.sol`)

- Estado crítico:
  - `message` (variable pública)
- Evento relevante:
  - `MessageUpdated(string newMessage)`
- Función sensible:
  - `setMessage(string)` → **cualquiera puede llamarla**

👉 Aunque es un contrato simple, **cualquier cambio de estado es relevante** y debe ser monitorizado.

---

## 2️⃣ Fuente de verdad: address del contrato

El script de deploy guarda la address aquí: `contracts/deployments/localhost.json`

```json
{
  "address": "0x..."
}
```

**Este archivo será la fuente única de verdad para monitorización**
* No hardcodear addresses
* Siempre leer desde el JSON de deploy. 
* En escenarios reales, la address debería obtenerse desde un Secrets Management System.

## 3️⃣ Enfoque de monitorización

Qué vamos a vigilar:
* ✔ Eventos MessageUpdated
* ✔ Transacciones enviadas al contrato
* ✔ Cambios de estado (lectura periódica de message)
* ✔ Actividad inesperada (spam, uso excesivo)

Qué NO vigilamos aún:
* Frontend
* Métricas avanzadas
* Alertas externas (Slack, etc.)

## 4️⃣ Dependencias necesarias

1. Desde la raíz del proyecto, install `ethers`  y `dotenv`:
```sh
npm install ethers dotenv
```

2. Create el script para monitorizar:
```sh
nano contracts/scripts/monitor.js
```
```js
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// ---------- CONFIG ----------

// RPC (localhost o red remota)
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

// Path al JSON generado por el deploy
const DEPLOY_FILE = path.join(
  __dirname,
  "../deployments/localhost.json"
);

// ABI mínima del contrato
const ABI = [
  "event MessageUpdated(string newMessage)",
  "function message() view returns (string)"
];

// ---------- LOAD CONTRACT ADDRESS ----------

const deployData = JSON.parse(fs.readFileSync(DEPLOY_FILE));
const CONTRACT_ADDRESS = deployData.address;

console.log(`📡 Monitoring HelloWorld at ${CONTRACT_ADDRESS}`);

// ---------- PROVIDER ----------

const provider = new ethers.JsonRpcProvider(RPC_URL);

// ---------- CONTRACT ----------

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  provider
);

// ---------- EVENT MONITORING ----------

// 1 Escuchar eventos MessageUpdated
contract.on("MessageUpdated", (newMessage, event) => {
  console.log("🚨 MessageUpdated event detected");
  console.log({
    newMessage,
    txHash: event.transactionHash,
    blockNumber: event.blockNumber
  });
});

// ---------- TX MONITORING ----------

// 2 Detectar transacciones enviadas al contrato
provider.on("pending", async (txHash) => {
  const tx = await provider.getTransaction(txHash);
  if (!tx || !tx.to) return;

  if (tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
    console.log("⚠️ Tx sent to HelloWorld contract");
    console.log({
      from: tx.from,
      hash: tx.hash,
      value: tx.value?.toString()
    });
  }
});

// ---------- STATE CHECK ----------

// 3 Lectura periódica del estado
async function checkMessage() {
  const msg = await contract.message();
  console.log(`📝 Current message: "${msg}"`);
}

// Check inicial
checkMessage();

// Cada 30 segundos
setInterval(checkMessage, 30_000);
```

## 6️⃣ Ejecutar la monitorización

En local (Hardhat node)

```sh
## Arranca el nodo
npx hardhat node

## Despliega el contrato
npx hardhat run scripts/deploy.js --network localhost

# Arranca el monitor
node scripts/monitor.js

# Deberias ver
📡 Monitoring HelloWorld at 0xABC...
📝 Current message: "Hello, World!"

🚨 MessageUpdated event detected
{
  newMessage: "Hola Web3",
  txHash: "0x123...",
  blockNumber: 42
}

⚠️ Tx sent to HelloWorld contract
{
  from: "0xDEF...",
  hash: "0x456..."
}
```

## 7️⃣ Próximo paso natural

Alertar/Notificar si es un comportamiento no esperado o continuar con lo siguiente:

* Monitorizar quién llama a `setMessage`
* Detectar spam o abuso
* Correlacionar: `from address` + `evento` + `frecuencia`
