1️⃣ Crear el proyecto Hardhat

mkdir dapp-project && cd dapp-project
npm init -y
npm install --save-dev hardhat
npx hardhat

2️⃣ Crear el contrato Token.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
    }
}