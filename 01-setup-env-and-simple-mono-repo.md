# 01. Setup a dApp development environment

## 1. Project structure


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

## 2. Setup steps


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

## 4. Create a React + TypeScript + Vite project
pnpm create vite my-app --template react-ts
cd my-app
pnpm install

## 5. Open project in VS Code and install recommended extensions
code .
# Recommended extensions:
# - ESLint
# - Prettier
# - React Developer Tools
# - TypeScript Hero
# - GitLens
# - DotENV

## 6. Set up ESLint and Prettier for linting and formatting
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y

## 7. Initialize Git and configure GitHub (optional)
git init
git config --global user.name "YourName"
git config --global user.email "you@example.com"
# Optional: authenticate GitHub CLI
# gh auth login

## 8. Create .env file for environment variables
echo "VITE_API_URL=https://api.yourdomain.com" > .env

## 9. Install and configure unit testing with Vitest
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
# Replace vite.config.ts content with:
cat << 'EOF' > vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
EOF

## 10. Run development server
pnpm dev
# Visit http://localhost:5173 in your browser

## 11. Perform vulnerability scan with OWASP ZAP
# Start the dev server with `pnpm dev`
# Open OWASP ZAP and scan http://localhost:5173 using Spider or Active Scan

## 12. (Optional) Create a Node.js backend with Express + TypeScript
mkdir backend && cd backend
pnpm init
pnpm add express
pnpm add -D typescript ts-node-dev @types/node @types/express
npx tsc --init

## 13. Approve blocked build scripts if you see warnings (pnpm v10+)
pnpm approve-builds
# Approve trusted packages like "esbuild" when prompted

```

