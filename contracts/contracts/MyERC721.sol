// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyERC721 is ERC721 {
    mapping(address => bool) claimedList;
    uint256 public nextTokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        nextTokenId = 1;
    }

    function airdrop() external {
        require(claimedList[msg.sender] == false, "This user has claimed air drop already.");
        _mint(msg.sender, nextTokenId);
        claimedList[msg.sender] = true;
        nextTokenId++;
    }
}
