# 06. Update backend to run locally and on Vercel


## Steps

__Step 1. Add Vercel config__


* Update `scripts` section:

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

__Step 2. Update the backend/tsconfig.json__

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

__Step 3. Optionally, add vercel.json to backend__

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

__Step 4. Build and run__

* Before we used `pnpm start` which is `ts-node index.ts`. Once updated `backend/package.json`, run next:

```sh
## Compile code and generate dist/
pnpm run build

## Run backend
pnpm start
```