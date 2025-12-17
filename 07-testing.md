# 07. dApp End-to-End Tests

Requirements:

- Synpress, Mochawesome (reports) and Playwright (Optional)
- A dApp up and running
- Metamask configured with the dApp

## Steps

### 1. Configure the Test environment


__Step 01. Create test folder in the frontend__

```sh
mkdir -p my-app/apps/frontend/tests/e2e
```

__Step 02. Install Synpress and Playground as dev dependencies__

```sh
cd my-app/apps/frontend/

pnpm add -D playwright @playwright/test
```

> (If you want HTML reports, you can also add @playwright/test only; Playwright core brings the test runner and reporter by default.)

This command will install all browsers (Chromium, Firefox, WebKit), ideal in CI/CD. Do it once only:
```sh
pnpm exec playwright install
```


__Step 03. Create and configure frontend/tsconfig.synpress.json__

```json
{
  "extends": "../../tsconfig.app.json",
  "include": ["tests/**/*.ts", "tests/**/*.js"]
}
```

__Step 04. Update my-app/tsconfig.app.json__

Make sure to have these values in `my-app/tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["es2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["apps/frontend", "tests", "apps/frontend/tests/e2e/**/*"]
}
```

### 2. Configure Playwright and Synpress


__Step 05. Configure playwright.config.ts in apps/frontend/__

> Only needed if want to customize playwright setup and keep separate from app.spec.ts

<!-- 
```js
// Import necessary Playwright and Synpress modules
import { defineConfig, devices } from '@playwright/test';

// Define Playwright configuration
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  reporter: [['list'], ['html']],
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
  },
  projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    // Additional Synpress-specific configuration can be added here
});
```
 -->

__Step 06. Create synpress.config.js in apps/frontend/__

> Only needed if using Synpress to test advanced scenarios with wallets, etc. In that case, Synpress should be integrated with Playwright and create `synpress.config.js` file.

<!-- ```js
import { defineConfig } from 'synpress/config';

export default defineConfig({
  testDir: './tests/e2e',
  walletSetupFilesDir: './tests/e2e',
  use: {
    baseURL: 'https://hello-dapp-fe.vercel.app',
    headless: true,
    screenshotOnRunFailure: true,
    video: 'retain-on-failure'
  }
});
``` -->

### 3. Write a simple E2E tests

__Step 07. Create simple test at tests/e2e/app.spec.ts__

```ts
import { test, expect } from '@playwright/test';

test('should display correct title', async ({ page }) => {
  await page.goto('https://hello-dapp-fe.vercel.app');
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/); // Update if your app title changes
});
```

### 4. Execute the tests

__Step 08. Add script to apps/frontend/package.json__

```json
...
  "type": "module",
  "scripts": {
    ...
    "test:e2e": "playwright test"
  }
...
```
__Step 09. Run tests in terminal__

```sh
cd my-dapp/apps/frontend

# Run headless (ideal for CI)
pnpm test:e2e

# Run with UI and Debug
pnpm test:e2e --headed
pnpm test:e2e --debug
```
