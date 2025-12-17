const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let Token, token, owner, addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy(ethers.parseUnits("1000", 18));
  });

  it("Debe asignar el total supply al owner", async function () {
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(await token.totalSupply());
  });

  it("Debe permitir transferencias entre cuentas", async function () {
    await token.transfer(addr1.address, ethers.parseUnits("100", 18));
    const balance = await token.balanceOf(addr1.address);
    expect(balance).to.equal(ethers.parseUnits("100", 18));
  });

  it("Debe fallar si no hay saldo suficiente", async function () {
    await expect(
      token.connect(addr1).transfer(owner.address, ethers.parseUnits("1", 18))
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });
});

