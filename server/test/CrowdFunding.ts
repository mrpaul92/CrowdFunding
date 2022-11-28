import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrowdFunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CrowdFundingFactory = await ethers.getContractFactory("CrowdFunding");
    const CrowdFunding = await CrowdFundingFactory.deploy();

    return { CrowdFunding, owner, otherAccount };
  }

  describe("Deployment", function () {});
});
