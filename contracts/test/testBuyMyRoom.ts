import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import {BuyMyRoom} from "../typechain-types";

describe("HouseTest", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [owner, otherAccount, user1, user2] = await ethers.getSigners();

    const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");
    const buyMyRoom = await BuyMyRoom.deploy();
    await buyMyRoom.deployed();

    return { buyMyRoom, owner, otherAccount, user1, user2 };
  }

  describe("Test functions", function() {
    // by the given hello-world to test the deployment of the contracts
    it("Default: hello world", async function () {
      const { buyMyRoom } = await loadFixture(deployFixture);
      expect(await buyMyRoom.helloworld()).to.equal("hello world");
    });

    it("Airdrop: Should claim air drop", async function () {
      const { buyMyRoom, user1  } = await loadFixture(deployFixture);
      await buyMyRoom.connect(user1 ).airdrop();
      expect(await buyMyRoom.ownerOf(1)).to.equal(user1.address);
    });

    it("Airdrop: Should not allow the same user to claim airdrop twice", async function () {
      const { buyMyRoom, user1 } = await loadFixture(deployFixture);

      await buyMyRoom.connect(user1).airdrop();
      expect(await buyMyRoom.ownerOf(1)).to.equal(user1.address);

      await expect(buyMyRoom.connect(user1).airdrop()).to.be.revertedWith("You have already claimed the airdrop.");
    });

    it("List: Should allow user to list house for sale", async function () {
      const { buyMyRoom, user1 } = await loadFixture(deployFixture);
      await buyMyRoom.connect(user1).airdrop();

      // User lists the house for sale
      const price = ethers.utils.parseEther("1.0"); // 1 ETH
      await buyMyRoom.connect(user1).approve(buyMyRoom.address, 1);
      await buyMyRoom.connect(user1).listHouse(1, price);

      // Check if the house is listed
      const houseInfo = await buyMyRoom.getHouseInfo(1);
      expect(houseInfo.owner).to.equal(user1.address);
      expect(houseInfo.isListed).to.be.true;
      expect(houseInfo.price).to.equal(price);
    });

  })
});