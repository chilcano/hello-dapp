# 05. Implement a serverless API in Frontend to call Alchemy

## Steps

__Step 1. Install deps__

```sh
mkdir apps/frontend/api && cd apps/frontend/api
pnpm add @vercel/node ethers 
```

__Step 2. Create getGasPrice.ts__

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

__Step 4. Install and config Vercel to run frontend with serverless API__

* Vite doesn't support natively serverless API.
* The `pnpm dev` will run `vite` to serve the frontend and serverless will not work.
* To run a Vite frontend and serverless API, we should use Vercel.
* To test locally frontend and serverless API, Vercel CLI should be installed globally, in root dir, frontend or backend.


```sh
cd my-app/
pnpm add -g vercel
```

* Create `apps/frontend/api/tsconfig.json` with this configuration:
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

__Step 5. Run Vercel locally to server frontend and serverless API__

* En la raíz del proyecto (por ejemplo, donde está tu ), ejecuta:
* In the root dir (i.e. where the main pnpm-workspace.yaml or package.json are on) run:
```sh
cd my-app/
vercel dev
```
You will see:

```sh
$ vercel dev

Vercel CLI 44.3.0
? Set up and develop “~/repos/me/hello-dapp/my-app”? yes
? Which scope should contain your project? Wayna's projects
? Link to existing project? no
? What’s your project’s name? my-app-local
? In which directory is your code located? ./apps/frontend
Local settings detected in vercel.json:
Auto-detected Project Settings (Vite):
- Build Command: vite build
- Development Command: vite --port $PORT
- Install Command: `yarn install`, `pnpm install`, `npm install`, or `bun install`
- Output Directory: dist
? Want to modify these settings? no
🔗  Linked to waynas-projects/my-app-local (created .vercel and added it to .gitignore)
> Running Dev Command “vite --port $PORT”

  VITE v7.0.3  ready in 100 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
> Ready! Available at http://localhost:3000
```

__Step 6. Fixing request to Backend when running with Vercel__

* If running in local, the request to backend will fail with `404` error because the proxy in frontend will not work with Vercel CLI.
* To check if backend works, only run frontend using `pnpm dev` (Vite project). This will run frontend on `http://localhost:5173/`