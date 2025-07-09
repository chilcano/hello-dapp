# 04. Implement a Backend to call Alchemy

## Steps

__Step 1. Install deps__

```sh
mkdir apps/backend && cd apps/backend
pnpm init

# Initialize a typescript project
pnpm exec tsc --init

# Install ts-node and typescript as development dependencies
pnpm add -D ts-node typescript

# Install dependencies
pnpm add express ethers dotenv

## Install the dependencies and their types
pnpm add -D typescript @types/node @types/express @types/dotenv
```

__Step 2. Create index.ts__

```ts
import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

__Step 3. Create the .env file__


```ini
ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/tu-api-key
PORT=3001
```

__Step 4. Update backend/package.json__

```json
...
"scripts": {
  "start": "ts-node index.ts"
}
...
```

__Step 4. Configure CORS in backend to work with frontend__

Since that backend and frontend run in different port, we should configure CORS properly.

This install CORS and its types in backend.
```sh
pnpm add cors
pnpm add -D @types/cors
```

__Step 5. Update backend to use CORS__

```ts
import cors from 'cors';

...

app.use(cors());
...
```

__Step 6. Update frontend to call to backend__

```ts
const fetchLastBlockFromBackend = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/getLastBlock');
    const data = await res.json();
    alert(`Último bloque: ${data.blockNumber}`);
  } catch {
    alert('Error fetching last block');
  }
};

...

<button onClick={fetchLastBlockFromBackend}>Get Last Block (via Alchemy securely)</button>
```

__Step 7. Remove unused dependencies__

```sh
## In the parent project dir or contracts/
pnpm remove @types/dotenv

## Optional - Install compatible versions of chai and @types/chain
pnpm add -D chai@^4.2.0 @types/chai@^4.2.0

# In apps/backend
cd apps/backend
pnpm remove @types/dotenv
pnpm add cors

## In the parent project dir
rm -rf node_modules
rm -f pnpm-lock.yaml
pnpm install
```

__Step 8. Test the full application__

```sh
cd apps/backend
pnpm start

cd apps/frontend
pnpm dev

```