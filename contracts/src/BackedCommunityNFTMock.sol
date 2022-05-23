// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.12;

contract BackedCommunityNFTMock {
    uint8 public statisticOne;
    uint8 public statisticTwo;

    address public owner;

    constructor(address _manager) {
        owner = _manager;
    }

    function setOwner(address newOwner) public {
        owner = newOwner;
    }

    function setStatisticOne(uint8 value) public {
        statisticOne = value;
    }

    function setStatisticTwo(uint8 value) public {
        statisticTwo = value;
    }
}
