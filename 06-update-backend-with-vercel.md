# 06. Update backend to run locally and on Vercel


## Steps

### Step 1. Add Vercel config in apps/backend/package.json


* Update the `scripts` section of `apps/backend/package.json`:

From:
```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "ts-node index.ts"
  },
...
```

To:
```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "vercel-build": "tsc"
  },
...
```

### Step 2. Update the apps/backend/tsconfig.json

* Make sure you have these values:

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./",
    "target": "ES2022",
    "module": "CommonJS",
    "esModuleInterop": true,
    "strict": true
  },
  "include": ["index.ts", "*.ts"]
}
```

### Step 3. Optionally, add vercel.json to backend

* This will prepare the configuration to deploy the backend on Vercel.

```sh
nano apps/backend/vercel.json
```

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.ts",
      "use": "@vercel/node",
      "config": { "tsconfig": "tsconfig.json" }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.ts"
    }
  ]
}
```

### Step 4. Build and run

* Before we used `pnpm start` which is `ts-node index.ts`. Once updated `backend/package.json`, we can run again the next command to build and run the backend:

```sh
## Compile code and generate dist/
pnpm run build

## Run backend
pnpm start
```
