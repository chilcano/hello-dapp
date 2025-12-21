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

echo "Key generation complete"
