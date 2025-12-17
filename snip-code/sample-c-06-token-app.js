1️⃣ Instalar dependencias

npm install dotenv @nomicfoundation/hardhat-toolbox

2️⃣ Configurar hardhat.config.js

require("dotenv").config();
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

3️⃣ Script de despliegue scripts/deploy.js

async function main() {
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy(ethers.parseUnits("1000", 18));
  console.log("Token deployed to:", await token.getAddress());
}
main();