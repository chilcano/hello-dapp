# 05. Setup Vercel and implement a serverless API in frontend

## Steps

**Goals:**
* Secrets stay server-side
* No VITE_ prefix
* Compatible with Vercel Node functions

### Step 1. Install deps in apps/frontend/api

```sh
cd my-app/apps/frontend 
mkdir api

pnpm add ethers@6.15.0
pnpm add -D @vercel/node@3.2.26 
```

### Step 2. Create apps/frontend/api/getGasPrice.ts

```ts
import { ethers } from 'ethers';

const ALCHEMY_URL = process.env.ALCHEMY_SEPOLIA_URL_SERVERLESS!;
const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);

export default async function handler(req: Request) {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice?.toString() ?? null;

    return new Response(
      JSON.stringify({ gasPrice }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching gas price' }),
      { status: 500 }
    );
  }
}
```

### Step 3. Update apps/frontend/App.tsx

**Add state:**
```ts
const [gasPrice, setGasPrice] = useState<string | null>(null);
const [gasPriceApiVisible, setGasPriceApiVisible] = useState(false);
```

**Add function:**
```ts
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
```

**Add JSX:**
```ts
<div style={{ marginTop: 20 }}>
  <button onClick={fetchGasPrice}>
    Get Gas Price (via Serverless API · securely)
  </button>

  {gasPrice !== null && <p>Gas Price (wei): {gasPrice}</p>}

  {gasPriceApiVisible && (
    <p style={{ fontSize: '0.8em', color: '#555' }}>
      API URL: <code>/api/getGasPrice</code>
    </p>
  )}
</div>
```

### Step 4. Configure environment variables in Vercel

* In Vercel Dashboard → Project → Environment Variables:
  ```ini
  ALCHEMY_SEPOLIA_URL_SERVERLESS=https://eth-sepolia.g.alchemy.com/v2/your-api-key
  ```
* Do NOT prefix with VITE_
* Do NOT expose this in frontend `.env`

### Step 5. Install and run Vercel locally to serve frontend and serverless API

* In the root dir (i.e. where the `pnpm-workspace.yaml` or main `package.json` are on) run:

```sh
pnpm add -g vercel
cd hello-dapp/my-app/apps/frontend/

## Run this for new Vercel project
vercel dev

## Run this is project has been created and/or linked
vercel dev --yes
```

### Step 6. Deployment to Vercel

* No changes required.
* Vercel automatically:
  - Builds Vite frontend
  - Deploys /api/* as serverless functions
  - Keeps secrets secure