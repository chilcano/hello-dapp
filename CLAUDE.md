# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3 dApp built with React, TypeScript, Vite, and Solidity. A monorepo using **pnpm workspaces** with three main components: a React frontend, an Express backend, and Solidity smart contracts. The dApp interacts with a HelloWorld contract on Sepolia testnet via Alchemy RPC and MetaMask.

## Repository Structure

- `my-app/` — pnpm workspace root
  - `apps/frontend/` — React 19 + Vite 7 frontend (ethers.js v6, MetaMask integration)
  - `apps/backend/` — Express 5 API (proxies Alchemy RPC calls to protect keys)
  - `contracts/` — Solidity contracts + Hardhat deployment
- `my-app-tests/` — Foundry/Forge project for Solidity unit tests (separate from the pnpm workspace)

## Build & Development Commands

All pnpm commands run from `my-app/` unless noted otherwise.

```bash
# Install all workspace dependencies
cd my-app && pnpm install

# Frontend
cd my-app/apps/frontend
pnpm dev          # Vite dev server with HMR
pnpm build        # Production build
pnpm preview      # Preview production build

# Backend
cd my-app/apps/backend
pnpm build        # TypeScript compile (tsc)
pnpm start        # Run compiled server (node dist/index.js)

# Smart contracts
cd my-app/contracts
pnpm check-env                # Validate required env vars
pnpm deploy:sepolia           # Deploy to Sepolia (runs check-env first)
```

## Testing

```bash
# Frontend E2E tests (Playwright + Synpress for MetaMask)
cd my-app/apps/frontend
pnpm test:e2e                 # Headless Playwright
pnpm test:e2e:headed          # Headed with Synpress/MetaMask

# Solidity unit tests (Foundry — separate project)
cd my-app-tests
forge test -v
```

## Linting

```bash
# ESLint (from frontend, where config is consumed)
cd my-app/apps/frontend
pnpm lint
```

ESLint config is at `my-app/eslint.config.js` — flat config using typescript-eslint, react-hooks, and react-refresh plugins. Prettier (3.6) is a dev dependency for formatting.

## Environment Variables

Frontend (`my-app/apps/frontend/.env`):
- `VITE_ALCHEMY_SEPOLIA_URL` — Alchemy RPC URL (exposed to browser via Vite)
- `VITE_BACKEND_URL` — Backend API URL
- `ALCHEMY_SEPOLIA_URL_SERVERLESS` — Used by Vercel serverless function (not exposed to browser)

Backend (`my-app/apps/backend/.env`):
- `ALCHEMY_URL` — Alchemy RPC URL

Contracts (`my-app/contracts/.env`):
- `ALCHEMY_SEPOLIA_RPC_URL` — RPC URL for Hardhat
- `WALLET_DEPLOYER_SEPOLIA_PRIVATE_KEY` — Deployer wallet private key

## Architecture Notes

- **RPC key protection**: The backend and serverless functions exist to proxy Alchemy RPC calls so API keys aren't exposed in the browser. The frontend's `/api/getGasPrice.ts` is a Vercel serverless function.
- **Contract addresses**: Deployment scripts save contract addresses to `contracts/deployments/localhost.json` and `contracts/contract-address.json`.
- **Deployment target**: Frontend and backend deploy to Vercel. Contracts deploy to Sepolia testnet.
- **Two test ecosystems**: Frontend uses Playwright/Synpress (E2E with wallet simulation). Contracts use Foundry/Forge (fast Solidity unit tests). These are in separate project roots.

## CI/CD Workflows

- `validate-issues.yaml` — Validates GitHub issue templates; enforces `[ISSUE]` or `[GRANT]` title prefixes
- `validate-pull-requests-ext.yaml` — Validates PR descriptions for external contributors (no URLs, no images, must select impact level); org members are exempt
- `run-sandboxed-claude-review.yaml` — Runs Claude code review in sandboxed environment when @claude is mentioned in PR comments
