# Upload Wallet Private Key to Vercel Project

## Steps 

### 1. Install dependencies


1. Install [vercel cli](https://vercel.com/docs/cli#installing-vercel-cli) - Vercel CLI to interact with and configure your Vercel Projects.
    
    ```sh
    # Install Vercel CLI globally
    pnpm i -g vercel
    
    # Get version installed
    vercel --version
    ```
    
2. Install [cast](https://getfoundry.sh/cast/overview/) - Ethereum CLI tool found in [Foundry](https://getfoundry.sh/) suite.
    
    ```sh
    # Download foundry installer `foundryup`
    curl -L https://foundry.paradigm.xyz | bash
    
    # Install forge, cast, anvil, chisel
    foundryup
    
    # Install the latest nightly release
    foundryup -i nightly

    # Apply changes in PATH
    source ~/.bashrc
    ```

3. Install [jq](https://jqlang.org/download/) - Tool used to filter, map and transform structured JSON data.


### 2. Follow this procedure

1. __Create wallet and private key generation__

    * Create it in `hello-dapp/snip-code/wallet-keys-to-vercel.sh`.

    ```sh
    #!/usr/bin/env bash
    set -euo pipefail
    set +x

    ENV_NAME="WALLET_PRIVATE_KEY"
    ENV_TARGET="production"

    echo "Creating new wallet"

    # Generate wallet fully in memory
    WALLET_JSON="$(cast wallet new --json)"
    ADDRESS="$(jq -r '.[0].address' <<<"$WALLET_JSON")"
    PRIVATE_KEY="$(jq -r '.[0].private_key' <<<"$WALLET_JSON")"

    echo "New wallet created"
    echo "Address: $ADDRESS"

    # Pipe private key directly into Vercel (non-interactive)
    printf '%s' "$PRIVATE_KEY" | vercel env add "$ENV_NAME" "$ENV_TARGET" --sensitive

    echo "Private key securely stored in Vercel environment variables"

    # Immediate cleanup
    unset PRIVATE_KEY WALLET_JSON

    echo "Key ceremony complete"
    ```

2. __Link your local environment and project to remote Vercel Project__

    * Run the bash script from the local vercel project is `hello-dapp/my-app/apps/frontend/`.
    * This is not mandatory, but helps to track variables with application.

    ```sh
    # (Recommended) Go to root directory of local project
    cd hello-dapp/my-app/apps/frontend/

    # Link your local project to Vercel project before setting variables
    vercel link --yes

    # Check if it's linked to Vercel successfully
    # You should see your Vercel handle
    vercel whoami
    ```

3. __Run the bash script__

    ```sh
    # From hello-dapp/my-app/apps/frontend/ run the bash script
    ../../.././snip-code/wallet-keys-to-vercel.sh

    Creating new wallet
    New wallet created
    Address: 0x5412C18fC26F6Ebb455Aaa61037A08D7951246bd
    Vercel CLI 50.1.2
    ✅  Added Environment Variable WALLET_PRIVATE_KEY to Project hello-dapp-fe [382ms]
    Private key securely stored in Vercel environment variables
    Key generation complete
    ```

4. __Save the Wallet Address to your Secret Vault Tool__

5. __Unlink local repo from Vercel Project__

    ```sh
    # Once completed Wallet ceremony, close the session and clean local env
    vercel logout
    find . -type d -name ".vercel" -exec rm -rf {} +
    ```

6. __In Vercel Admin UI you should see this__

    ![](helloworld-02-wallet-privkey-to-vercel.png)

