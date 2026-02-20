# Security Review Report — hello-dapp

**Generated:** 2026-02-13T15:57:13Z
**Reviewer:** Claude Code (Opus 4.6)
**Scope:** Full project — smart contracts, frontend, backend, CI/CD, infrastructure

---

## Executive Summary

This is a Web3 tutorial/educational dApp (React + Express + Solidity) deployed on Ethereum Sepolia via Vercel. The project demonstrates both **secure** and **intentionally insecure** patterns for learning purposes. This review identifies real vulnerabilities, architectural risks, and actionable recommendations across all layers.

| Severity | Count |
|----------|-------|
| CRITICAL | 3     |
| HIGH     | 5     |
| MEDIUM   | 6     |
| LOW      | 5     |
| INFO     | 4     |

---

## CRITICAL Findings

### C1 — Integer Underflow in Token Contract (example1/token.sol)

**File:** `my-app-tests/src/example1/token.sol:37-43`
**Severity:** CRITICAL

```solidity
function transfer(address to, uint256 value) public whenNotPaused {
    unchecked {
        balances[msg.sender] -= value;
        balances[to] += value;
    }
}
```

**Impact:** Any user can transfer more tokens than they own. A user with 0 balance can transfer 1 token, causing their balance to underflow to `type(uint256).max` (~1.15e77 tokens). This is confirmed by the test suite (`token.t.sol:96-123`).

**Recommendation:** Remove `unchecked` or add a balance check:
```solidity
require(balances[msg.sender] >= value, "Insufficient balance");
```

**Note:** This appears intentional for educational purposes but would be catastrophic in production.

---

### C2 — CI/CD Workflow Leaks All Environment Variables to External URL

**File:** `.github/workflow/send-sensitive-info-to-url.yaml`
**Severity:** CRITICAL

The workflow runs `printenv` and POSTs the entire environment to an external webhook URL (`webhook.site`). In a GitHub Actions context this would expose:

- `GITHUB_TOKEN` (repo access)
- Any configured secrets injected into the environment
- Runner metadata and internal URLs

**Impact:** Full credential exfiltration if triggered. Even as a demo, this workflow exists in the repo and could be triggered by anyone with `workflow_dispatch` permissions.

**Recommendation:** Delete this workflow or, if kept for educational purposes, add a prominent `# DEMO ONLY — DO NOT USE IN REAL PROJECTS` warning and ensure the repository is private with restricted dispatch permissions.

---

### C3 — Alchemy RPC API Key Exposed to Browser

**File:** `my-app/apps/frontend/App.tsx:13`

```typescript
const ALCHEMY_URL_FROM_VITE = import.meta.env.VITE_ALCHEMY_SEPOLIA_URL;
```

Any `VITE_` prefixed env var is bundled into the frontend JavaScript and visible to any user via browser DevTools or source inspection. The Alchemy API key is directly exposed.

**Impact:** Key abuse — attackers can use the exposed key for their own RPC calls, potentially exhausting the API quota or incurring costs.

**Recommendation:** Route all RPC calls through the backend (BFF pattern, which the project already partially implements). Remove `VITE_ALCHEMY_SEPOLIA_URL` from the frontend entirely.

---

## HIGH Findings

### H1 — HelloWorld Contract Has No Access Control on setMessage

**File:** `my-app/contracts/contracts/HelloWorld.sol:9-12`

```solidity
function setMessage(string calldata _newMessage) public {
    message = _newMessage;
    emit MessageUpdated(_newMessage);
}
```

**Impact:** Any address can overwrite the message. There is no `onlyOwner` modifier or role-based access. If this contract held any business logic dependent on the message, it would be fully manipulable.

**Recommendation:** Add an `Ownable` pattern with `onlyOwner` modifier if the message should be restricted.

---

### H2 — Backend CORS Is Fully Open

**File:** `my-app/apps/backend/index.ts:11`

```typescript
app.use(cors());
```

`cors()` with no options allows requests from **any origin**.

**Impact:** Any website can call the backend API, enabling abuse of the RPC proxy from external sites.

**Recommendation:** Restrict CORS to the frontend domain:
```typescript
app.use(cors({ origin: 'https://your-frontend-domain.vercel.app' }));
```

---

### H3 — No Rate Limiting on Backend or Serverless APIs

**Files:** `my-app/apps/backend/index.ts`, `my-app/apps/frontend/api/getGasPrice.ts`

Neither endpoint implements rate limiting.

**Impact:** An attacker can flood the endpoints, exhausting Alchemy API quota and causing denial of service for legitimate users.

**Recommendation:** Add rate limiting via `express-rate-limit` for the Express backend and Vercel's built-in edge rate limiting or a middleware for the serverless function.

---

### H4 — Owner Takeover Vulnerability in example2/token.sol

**File:** `my-app-tests/src/example2/token.sol:7-9`

```solidity
function Owner() public {
    owner = msg.sender;
}
```

This is a public function (not a constructor). Anyone can call `Owner()` at any time to become the contract owner.

**Impact:** Complete ownership takeover — attacker gains `onlyOwner` privileges including pause/resume control.

**Recommendation:** This mirrors the classic Rubixi vulnerability. In modern Solidity, use a `constructor` instead:
```solidity
constructor() {
    owner = msg.sender;
}
```

---

### H5 — No Input Validation on Serverless API

**File:** `my-app/apps/frontend/api/getGasPrice.ts:7`

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
```

The handler accepts any HTTP method (GET, POST, PUT, DELETE, etc.) with no validation.

**Recommendation:** Restrict to GET only:
```typescript
if (req.method !== 'GET') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

## MEDIUM Findings

### M1 — No .env in .gitignore at Root Level

**File:** `.gitignore`

The root `.gitignore` only contains `.vercel`. There is no exclusion for `.env` files at the root level.

**Impact:** Accidental commit of `.env` files containing private keys and API keys.

**Recommendation:** Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

---

### M2 — Contract Address Hardcoded and Committed

**File:** `my-app/apps/frontend/contract-address.json`

```json
{"address": "0x857bc1DdfFd1f3272AAf41D08E73954F6d278882"}
```

This is committed to the repo. While the address itself is public on-chain, hardcoding it creates a tight coupling and makes environment management harder.

**Recommendation:** Move to an environment variable (`VITE_CONTRACT_ADDRESS`) or generate dynamically during deployment.

---

### M3 — Non-Null Assertion on Environment Variables (Backend)

**Files:** `my-app/apps/backend/index.ts:13`, `my-app/apps/frontend/api/getGasPrice.ts:4`

```typescript
const ALCHEMY_URL = process.env.ALCHEMY_URL!;
```

The `!` operator silently bypasses TypeScript's null check. If the env var is missing, `ethers.JsonRpcProvider` receives `undefined`, leading to confusing runtime errors.

**Recommendation:** Validate at startup:
```typescript
const ALCHEMY_URL = process.env.ALCHEMY_URL;
if (!ALCHEMY_URL) throw new Error('ALCHEMY_URL is required');
```

---

### M4 — Solidity Compiler Version Mismatch

- `HelloWorld.sol` specifies `^0.8.24`
- `hardhat.config.js` uses `0.8.28`
- Token contracts use `^0.8.0`

**Impact:** Inconsistent compiler behavior across contracts. Older `^0.8.0` range allows any 0.8.x, missing security fixes in later versions.

**Recommendation:** Pin all contracts to a specific recent version (e.g., `0.8.28`) and align with `hardhat.config.js`.

---

### M5 — No HTTPS Enforcement or Security Headers

**File:** `my-app/apps/backend/index.ts`

The Express backend does not set security headers (Helmet, Content-Security-Policy, X-Frame-Options, etc.).

**Recommendation:** Add `helmet` middleware:
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### M6 — Wallet Key Workflow Uses Shell Variables for Secrets

**File:** `.github/workflow/push-wallet-keys-to-vercel.yaml:44-55`

```yaml
WALLET_JSON="$(cast wallet new --json)"
PRIVATE_KEY="$(jq -r '.[0].private_key' <<<"$WALLET_JSON")"
```

While `unset` is called afterward, the private key exists in process memory and potentially in `/proc/*/environ` or shell history during execution.

**Impact:** Temporary exposure window for the private key on the CI runner.

**Recommendation:** The current approach is reasonable for CI but consider piping directly without intermediate variables:
```bash
cast wallet new --json | jq -r '.[0].private_key' | vercel env add ...
```

---

## LOW Findings

### L1 — Frontend Error Handling Only Logs to Console

**File:** `my-app/apps/frontend/App.tsx` (lines 69, 93, 113, 133, 149, 161)

All errors are caught with `console.error(error)` and silently swallowed. Users get no feedback on most failures.

**Recommendation:** Add user-facing error states/messages for failed operations.

---

### L2 — No Event Emission on Token Transfers

**File:** `my-app-tests/src/example1/token.sol:37-43`

The Token contract does not emit a `Transfer` event, making it impossible to track transfers off-chain.

**Recommendation:** Add a `Transfer` event following the ERC-20 standard.

---

### L3 — Vite Proxy Uses `secure: false`

**File:** `my-app/apps/frontend/vite.config.ts:13`

```typescript
secure: false,
```

This disables SSL certificate validation for the dev proxy.

**Impact:** Low (dev only), but establishes a bad pattern. Ensure this is never used in production.

---

### L4 — No TypeScript Strict Mode in Some Configs

Several `tsconfig` files may not enforce strict mode, allowing implicit `any` types and reducing type safety.

**Recommendation:** Enable `"strict": true` across all TypeScript configurations.

---

### L5 — Default Webhook Token Hardcoded in CI Workflow

**File:** `.github/workflow/send-sensitive-info-to-url.yaml:10`

```yaml
default: "6f5c6d00-df46-4a5a-813b-b72a19383119"
```

A specific webhook.site token is hardcoded as the default, making it predictable.

**Impact:** Combined with C2, anyone who knows this default can pre-monitor the webhook endpoint.

---

## INFORMATIONAL

### I1 — Educational Insecure Patterns Are Well-Labeled

The frontend explicitly labels insecure calls as "insecure" and secure calls as "secure" in the UI. The security documentation (guides 11-12) is thorough and well-written.

### I2 — Dev Container Security Hardening Is Excellent

The `.devcontainer/devcontainer.json` implements best-practice container hardening:
- `--cap-drop=ALL`
- `--read-only` filesystem
- `--no-new-privileges`
- PID limits and memory limits
- Network isolation via `sandbox-net`
- `noexec` on tmpfs mounts
- `NPM_CONFIG_IGNORE_SCRIPTS=true` (prevents supply-chain attacks)

### I3 — GitHub Actions Use Pinned SHA Versions

All GitHub Actions use pinned commit SHAs rather than mutable tags, preventing supply-chain attacks through tag manipulation. This is a strong security practice.

### I4 — BFF Architecture Pattern Is Sound

The Backend-for-Frontend pattern documented and partially implemented is the correct approach for Web3 dApps. The documentation in guides 11-12 provides excellent security guidance.

---

## Recommendations Summary (Priority Order)

| # | Action | Severity | Effort |
|---|--------|----------|--------|
| 1 | Remove or heavily restrict `send-sensitive-info-to-url.yaml` | CRITICAL | Low |
| 2 | Add balance check to Token contracts (or mark as intentional demo) | CRITICAL | Low |
| 3 | Remove `VITE_ALCHEMY_SEPOLIA_URL` — route all RPC through backend | CRITICAL | Medium |
| 4 | Fix `Owner()` function in example2 — use `constructor` | HIGH | Low |
| 5 | Restrict CORS to frontend domain | HIGH | Low |
| 6 | Add rate limiting to all API endpoints | HIGH | Medium |
| 7 | Add access control to `HelloWorld.setMessage()` | HIGH | Low |
| 8 | Add `.env` patterns to `.gitignore` | MEDIUM | Low |
| 9 | Add `helmet` security headers to Express backend | MEDIUM | Low |
| 10 | Validate env vars at startup instead of using `!` assertion | MEDIUM | Low |
| 11 | Pin Solidity compiler versions consistently | MEDIUM | Low |
| 12 | Add HTTP method validation to serverless functions | HIGH | Low |

---

## Scope & Methodology

This review covered:
- **Smart Contracts:** `HelloWorld.sol`, `Counter.sol`, `Token.sol` (both examples)
- **Frontend:** `App.tsx`, Vite config, environment setup
- **Backend:** Express server, Vercel serverless function
- **Infrastructure:** GitHub Actions workflows, devcontainer config, `.gitignore`
- **Dependencies:** `package.json` files (structural review, not full SCA)

**Out of scope:** Full dependency vulnerability scanning (npm audit), Alchemy account configuration, Vercel deployment settings, and live penetration testing.

---

*Report generated by Claude Code (Opus 4.6) on 2026-02-13T15:57:13Z*
