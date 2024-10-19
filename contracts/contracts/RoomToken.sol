// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RoomToken is ERC20{
    event TokensExchanged(address user, uint256 weiAmount, uint256 tokenAmount);
    event TokensWithdraw(address user, uint256 weiAmount, uint256 tokenAmount);
    uint256 public conversionRate;
    address public platformOwner;

    constructor() ERC20("RoomToken", "RTK") {
        conversionRate = 100; // Example: 1 ETH = 100 RTK
        platformOwner = msg.sender;
    }

    // convert ETH to ERC20 token
    function exchangeETHForTokens() external payable {
        require(msg.value > 0, "Need to send ETH to get tokens");

        uint256 tokenAmount = msg.value * conversionRate / 1 ether;
        _mint(msg.sender, tokenAmount);

        emit TokensExchanged(msg.sender, msg.value, tokenAmount);
    }

    // withdraw REC20 to wallet
    function withdrawTokenForETH(uint256 tokenAmount) external {
        require(tokenAmount > 0, "You need to specify an amount of tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");

        uint256 weiAmount = tokenAmount * 1 ether / conversionRate;
        _burn(msg.sender, tokenAmount);
        payable(msg.sender).transfer(weiAmount);

        emit TokensWithdraw(msg.sender, weiAmount, tokenAmount);
    }

    receive() external payable {}
}
