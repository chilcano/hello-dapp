import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

const ALCHEMY_URL = process.env.VITE_ALCHEMY_SEPOLIA_URL!;
const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const gasPrice = await provider.getGasPrice();
    res.status(200).json({ gasPrice: gasPrice.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching gas price' });
  }
}
