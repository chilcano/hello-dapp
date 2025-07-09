import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const ALCHEMY_URL = process.env.ALCHEMY_URL!;
const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);

app.get('/api/getLastBlock', async (req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching block number' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API listening on port ${PORT}`);
});
