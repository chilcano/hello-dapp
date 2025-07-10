import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

const ALCHEMY_URL_SERVERLESS = process.env.ALCHEMY_SEPOLIA_URL_SERVERLESS!;
const provider = new ethers.JsonRpcProvider(ALCHEMY_URL_SERVERLESS);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice?.toString() ?? null;
    res.status(200).json({ gasPrice });
  } catch (error) {
    console.error('Error fetching gas price:', error);
    res.status(500).json({ error: 'Error fetching gas price' });
  }
}
