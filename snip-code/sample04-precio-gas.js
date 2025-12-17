import { ethers } from "ethers";
const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/<API_KEY>");
const gas = await provider.getFeeData();
console.log("Gas price:", ethers.formatUnits(gas.gasPrice, "gwei"));
