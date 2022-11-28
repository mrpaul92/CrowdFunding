import { ethers, upgrades } from "hardhat";

const OLD_ADDRESS = "";

async function main() {
  const CrowdFundingFactoryV2 = await ethers.getContractFactory("CrowdFundingV2");
  const CrowdFunding = await upgrades.upgradeProxy(OLD_ADDRESS, CrowdFundingFactoryV2);
  console.log(`CrowdFunding Upgraded!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
