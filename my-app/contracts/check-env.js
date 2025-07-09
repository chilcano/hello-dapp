require('dotenv').config();

const requiredVars = [
  'ALCHEMY_SEPOLIA_RPC_URL',
  'WALLET_DEPLOYER_SEPOLIA_PRIVATE_KEY'
];

let hasMissing = false;

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    hasMissing = true;
  }
}

if (hasMissing) {
  console.error('\n💡 Create a .env file based on .env.example and fill in the required values.\n');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
}
