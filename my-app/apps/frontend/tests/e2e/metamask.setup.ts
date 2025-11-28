import { defineWalletSetup, Wallet } from '@synthetixio/synpress/support/wallet';

export default defineWalletSetup(async () => {
  const wallet = new Wallet();
  await wallet.unlock();
  await wallet.import();
});
