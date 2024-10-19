import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
          '0x8bd608356b9193cf2d8ec863b7aafaca85a110b68c8bc882e390fe6fe568e68d',
          '0x0595b6c6916b90659459ac9a3f0c43b49953fe9caa8906b0330f9cf5fb33e37f',
          '0x4ef149d20ce1e453c0a05d2d5bd476967b2d411e08ac06544fef67ce47de7e5e',
      ]
    },
  },
};

export default config;
