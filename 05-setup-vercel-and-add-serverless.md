# 05. Setup Vercel and implement a serverless API in frontend

## Steps

### Step 1. Install deps in apps/frontend/api

```sh
mkdir apps/frontend/api && cd apps/frontend/api
pnpm add @vercel/node ethers 
```

### Step 2. Create apps/frontend/api/getGasPrice.ts

```ts
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
```

### Step 3. Update apps/frontend/App.tsx

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

..and the `jsx` section of `apps/frontend/App.tsx` add the next:

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

### Step 4. Install and config Vercel to run frontend with serverless API

* Vite doesn't support natively serverless API.
* The `pnpm dev` will run `vite` to serve the frontend and serverless will not work.
* To run a Vite frontend and serverless API, we should use Vercel.
* To test locally frontend and serverless API, [Vercel CLI](https://vercel.com/docs/cli) should be installed globally, in root dir, frontend or backend.
* [Vercel CLI](https://vercel.com/docs/cli) allows automate syncing local project with Vercel Platform as well.


```sh
cd my-app/apps/frontend/

pnpm add -g vercel
```

* Create `api/tsconfig.json` with this configuration:

```json
{
  "extends": "../../tsconfig.app.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["*.ts"]
}
```

### Step 5. Run Vercel locally to serve frontend and serverless API

* In the root dir (i.e. where the `pnpm-workspace.yaml` or main `package.json` are on) run:

```sh
cd hello-dapp/my-app/apps/frontend/

## Run this for new Vercel project
vercel dev

## Run this is project has been created and/or linked
vercer dev --yes
```

You will see:

```sh
...
🔗  Linked to wayna-projects/frontend (created .vercel)
> Downloading `development` Environment Variables for wayna-projects/frontend
✅  Created .env.local file and added it to .gitignore [278ms]
> Running Dev Command “vite --port $PORT”

  VITE v7.0.3  ready in 92 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
> Ready! Available at http://localhost:3000
```

### Step 6. Fixing request to Backend when running with Vercel

* If running in local, the request to backend will fail with `404` error because the proxy in frontend will not work with Vercel CLI.
* To check if backend works, only run frontend using `pnpm dev` (Vite project). This will run frontend on `http://localhost:5173/`
