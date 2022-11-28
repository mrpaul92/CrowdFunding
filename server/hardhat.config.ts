import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    polygon: {
      url: process.env.POLYGON_NODE_URL,
      accounts: [process.env.POLYGON_ACCOUNT_PRIVATE_KEY ? process.env.POLYGON_ACCOUNT_PRIVATE_KEY : ""],
    },
  },
};

export default config;
