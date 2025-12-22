const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const hello = await HelloWorld.deploy();  
  await hello.waitForDeployment();

  // Since Hardhat v2.20+, using @nomicfoundation/hardhat-ethers, the returned contract by getContractFactory(...).deploy() 
  // has been deployed automatically and don't have .deployed() like before.
  //await hello.deployed();

  // Get deployed address
  const address = await hello.getAddress();
  console.log("HelloWorld smartcontract deployed. Address: ", address);

  const deployData = { address };

  // Save in deployments/localhost.json
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  fs.mkdirSync(path.dirname(deployPath), { recursive: true });
  fs.writeFileSync(deployPath, JSON.stringify(deployData, null, 2));

  // Also copy to frontend/src/ to be used in React
  const frontendPath = path.join(__dirname, "../../apps/frontend/src/contract-address.json");
  fs.writeFileSync(frontendPath, JSON.stringify(deployData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});