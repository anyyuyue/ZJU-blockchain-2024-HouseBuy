// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721,ERC20
// You can use this dependency directly because it has been installed by TA already
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MyERC721.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BuyMyRoom {
    // use a event if you want
    // to represent time you can choose block.timestamp
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseSold(uint256 tokenId, uint256 price, address buyer);

    // maybe you need a struct to store information
    struct House {
        address owner;
        uint256 listedTimestamp;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => House) public houses; // A map from house-index to its information

    MyERC721 public myERC721;
    uint256 public feeRate; // for platformOwner
    address public platformOwner;

    constructor() {
        myERC721 = new MyERC721("HouseToken", "HouseSymbol");
        feeRate = 1; // let 1% of the price to platformOwner
        platformOwner = msg.sender;  // deployer of the contract is platformOwner
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    function listHouse(uint256 tokenId, uint256 price) external {
        require(myERC721.ownerOf(tokenId) == msg.sender, "You are not the owner of this house.");
        require(!houses[tokenId].isListed, "House is already listed.");

        houses[tokenId] = House({
            owner: msg.sender,
            listedTimestamp: block.timestamp,
            price: price,
            isListed: true
        });
        emit HouseListed(tokenId, price, msg.sender);
    }

    function buyHouse(uint256 tokenId) external payable {
        House storage house = houses[tokenId];
        require(house.isListed, "House is not for sale.");
        require(msg.value == house.price, "Incorrect payment amount.");

        // calculate the fee for platformOwner, avoid float number
        uint256 platformFee = (block.timestamp - house.listedTimestamp)/60 * feeRate/100 * house.price;
        uint256 sellerFee = house.price - platformFee;
        require(sellerFee>0, "This house has listed for too long time to be sold");

        payable(house.owner).transfer(sellerFee);
        payable(platformOwner).transfer(platformFee);

        myERC721.safeTransferFrom(house.owner, msg.sender, tokenId);

        house.owner = msg.sender;
        house.isListed = false;

        emit HouseSold(tokenId, house.price, msg.sender);
    }

    // get house info of specific house
    function getHouseInfo(uint256 tokenId) external view returns(address owner, bool isListed, uint256 price, uint256 listTimestamp) {
        House memory house = houses[tokenId];

        return (house.owner, house.isListed, house.price, house.listedTimestamp);
    }

    // get the house list of user itself
    function getMyHouses() external view returns(uint256[] memory) {
        uint256 houseCount = myERC721.balanceOf(msg.sender);
        uint256[] memory ownedHouses = new uint256[](houseCount);

        uint256 counter=0;
        for (uint256 tokenId = 1; tokenId < myERC721.nextTokenId(); tokenId++) {
            if(myERC721.ownerOf(tokenId) == msg.sender) {
                ownedHouses[counter] = tokenId;
                counter++;
            }
        }
        return ownedHouses;
    }

    // get listed houses to be sold
    function getListedHouses() external view returns(uint256[] memory) {
        uint256 houseCount = myERC721.balanceOf();
        uint256[] memory listedHouses = new uint256[](houseCount);

        uint256 counter=0;
        for (uint256 tokenId = 1; tokenId < myERC721.nextTokenId(); tokenId++) {
            if(myERC721) {
                listedHouses[counter] = tokenId;
                counter++;
            }
        }
        return listedHouses;
    }
}