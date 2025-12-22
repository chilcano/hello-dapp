# 01. Setup a dApp development environment

## 1. Setup initial 

### Project structure

```sh
$ tree my-app/. -I node_modules
my-app/.
├── apps
│   ├── backend
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend
│       ├── App.css
│       ├── App.tsx
│       ├── assets
│       │   └── react.svg
│       ├── contract-address.json
│       ├── index.css
│       ├── index.html
│       ├── main.tsx
│       ├── package.json
│       └── vite.config.ts
├── contracts
│   ├── artifacts
│   │   ├── build-info
│   │   │   └── f3f58e5d18ae0fbdc9291e1b86cbbac2.json
│   │   └── contracts
│   │       └── HelloWorld.sol
│   │           ├── HelloWorld.dbg.json
│   │           └── HelloWorld.json
│   ├── cache
│   │   └── solidity-files-cache.json
│   ├── check-env.js
│   ├── contracts
│   │   └── HelloWorld.sol
│   ├── deployments
│   │   └── localhost.json
│   ├── hardhat.config.js
│   ├── ignition
│   │   └── modules
│   │       └── Lock.js
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── scripts
│   │   └── deploy.js
│   └── test
│       └── Lock.js
├── eslint.config.js
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── public
│   └── vite.svg
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.node.json

18 directories, 34 files
```

### NodeJS environment setup

```sh
## 1. Update the system
sudo apt update && sudo apt upgrade -y

## 2. Install Node.js and npm using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v && npm -v

## 3. Install PNPM (faster alternative to npm/yarn)
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
```

## 2. Steps to create and deploy a React frontend application

### Step 1 - Create a frontend application

* Frontend will use Vite (not CRA) and ethers 6.x

```sh
## 1. Create a React + TypeScript + Vite project
mkdir my-app/apps/frontend/ && cd my-app/apps/frontend
pnpm create vite@latest . --template react-ts
pnpm install
# Approve blocked build scripts if you see warnings (pnpm v10+)
pnpm approve-builds

## 2. Install deps
pnpm add ethers@6.15.0
```

### Step 2 – Update/Verify package.json

Make sure the important parts look like this and do NOT add comments:

```json
{
  "name": "frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  ...
}
```

### Step 3 – Create frontend .env (local)

```sh
cat << 'EOF' > .env
VITE_ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
EOF
```

### Step 4 – Add contract address file

* Make sure the `src/contract-address.json` has been created when deploying the contract. Otherwise, you can create it:

```sh
cat << 'EOF' > src/contract-address.json
{
  "address": "0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
}
EOF
```

### Step 5 - Run the initial frontend application

```sh
pnpm dev
```

### Step 6 – Update src/App.tsx to work with deployed contract and MetaMask

* The `src/App.tsx` will be updated accordingly in the next phase.

### Step 7 - (Optional) Perform vulnerability scan with OWASP ZAP

* Start the dev server with `pnpm dev`
* Open [OWASP ZAP](https://www.zaproxy.org/download/) and scan http://localhost:5173 using Spider or Active Scan
