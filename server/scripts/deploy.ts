import { ethers } from "hardhat";

async function main() {
  const CrowdFundingFactory = await ethers.getContractFactory("CrowdFunding");
  const CrowdFunding = await CrowdFundingFactory.deploy();
  await CrowdFunding.deployed();

  console.log(`CrowdFunding Contract deployed to: ${CrowdFunding.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
