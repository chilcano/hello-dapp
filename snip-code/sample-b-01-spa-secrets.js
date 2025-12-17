// 1. Crea un proyecto Vite:

npm create vite@latest exposed-app --template react
cd exposed-app
npm install ethers


// 2. Crea un archivo .env:

VITE_ALCHEMY_KEY=demo-key


// 3. En src/App.jsx, añade:

import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
);

provider.getBlockNumber().then((n) => console.log("Bloque:", n));

///////////// Corrección /////////////////////


// server.js
import express from "express";
import fetch from "node-fetch";
const app = express();
const ALCHEMY = process.env.ALCHEMY_KEY;

app.use(express.json());

app.post("/rpc", async (req, res) => {
  const r = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await r.json();
  res.json(data);
});

app.listen(3000);
