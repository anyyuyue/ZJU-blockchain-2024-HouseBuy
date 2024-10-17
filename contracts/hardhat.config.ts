import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
          // '0x172a483415c5e119f1ea336d44646572ac34a088e7bc2884f8e1f83da4cb304a',
          '0xe4b3c57859407722a2863d95eb90b131dcd5136878f06c8febe245188e0b3f97',
          '0xa9616284199b57d3743667a9c03f3f4466f3870a0455a9c22eb538c0a5e87359',
          '0x4b71774bb483efccf824319624e020619eff1c1f47c91525e4e64140219030d4',
          '0x015ffb6bb28b6b6c74b39e040102373d1241a96af8a8fdba1597d4a2117ea368'
      ]
    },
  },
};

export default config;
