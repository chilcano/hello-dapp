# 05. Implement a serverless API in Frontend to call Alchemy

## Steps

__Step 1. Install deps__

```sh
mkdir apps/frontend/api && cd apps/frontend/api
pnpm add @vercel/node
```

__Step 2. Create getGasPrice.ts__

```ts
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
```

__Step 3. Update frontend/App.tsx__

```ts
...
const [gasPrice, setGasPrice] = useState<string | null>(null);
const [gasPriceApiVisible, setGasPriceApiVisible] = useState(false);

const fetchGasPrice = async () => {
  try {
    const res = await fetch('/api/getGasPrice');
    const data = await res.json();
    setGasPrice(data.gasPrice);
    setGasPriceApiVisible(true);
  } catch {
    setGasPrice(null);
    setGasPriceApiVisible(false);
  }
};
...
```

..and the `jsx` section of `frontend/App.tsx` add the next:
```ts
...
<div style={{ marginTop: 20 }}>
  <button onClick={fetchGasPrice}>Get Gas Price (via Serverless API · securely)</button>
  {gasPrice !== null && <p>Gas Price (wei): {gasPrice}</p>}
  {gasPriceApiVisible && (
    <p style={{ fontSize: '0.8em', color: '#555' }}>
      API URL: <code>/api/getGasPrice</code>
    </p>
  )}
</div>
...
```
