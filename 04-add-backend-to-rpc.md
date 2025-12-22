# 04. Implement a Backend to call Alchemy

## Steps

### Step 1. Create my-app/apps/backend/, initialize and install deps

* This backend will use Express and ethers v6

```sh
mkdir my-app/apps/backend && cd my-app/apps/backend
pnpm init
```

**Replace the generate package.json with the following:**  
```json
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "packageManager": "pnpm@10.12.4"
}
```

**Install runtime and dev dependencies**  
```sh
pnpm add express@5.1.0 cors@2.8.5 dotenv@16.6.1 ethers@6.15.0
pnpm add -D typescript@5.8.3 @types/node@24.10.4 @types/express@5.0.6 @types/cors@2.8.19 tsx@4.19.2
```

### Step 2. Create tsconfig.json

* You can create it with `pnpm exec tsc --init` and after that update it or create it from scratch.

```sh
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    "outDir": "dist",
    "rootDir": ".",

    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "include": ["index.ts"]
}
EOF
```

### Step 3. Create the apps/backend/.env file

```ini
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
PORT=3001
```

### Step 4. Create apps/backend/index.ts

* Since that backend and frontend run in different ports, we should configure CORS properly. CORS has been already installed above.

```ts
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
```

### Step 5. Run backend in development mode and test it

```sh
pnpm dev

> backend@1.0.0 dev /home/chilcano/ebis-repo/hello-dapp/my-app/apps/backend
> tsx index.ts

Backend API listening on port 3001
```
This means that we use `tsx` in development. In simple words, `tsx` is dev only and not bundled in production.

In separate terminal run this:
```sh
curl http://localhost:3001/api/getLastBlock -s | jq .

{
  "blockNumber": 9892541
}
```

### Step 6. Build for production and run in production mode

```sh
pnpm build
```
This generates `dist/index.js`, this means that compiled JS is used in production (Vercel/Railway/Docker). 

To run in production, execute this:
```sh
pnpm start

> backend@1.0.0 start /home/chilcano/ebis-repo/hello-dapp/my-app/apps/backend
> node dist/index.js

Backend API listening on port 3001
```

### Step 7. Update frontend/App.tsx to call to backend

```ts
const fetchLastBlockFromBackend = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/getLastBlock');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    alert(`Last block number: ${data.blockNumber}`);
  } catch {
    alert('Error fetching last block');
  }
};

...

<button onClick={fetchLastBlockFromBackend}>Get Last Block (via Alchemy securely)</button>
```

### Step 8. Run the full application to test integration

In separate terminal, run the next commands:

```sh
cd apps/backend
pnpm start

#cd apps/frontend
cd hello-dapp/my-app/
pnpm dev
```
