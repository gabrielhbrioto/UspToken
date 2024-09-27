import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337, // ID da rede para Hardhat Network
    },
    sepolia: {
      url: process.env.RPC_NODE,         
      chainId: Number(process.env.CHAIN_ID),
      accounts: {
        mnemonic: process.env.SECRET
      }
    }
  }
};

export default config;


