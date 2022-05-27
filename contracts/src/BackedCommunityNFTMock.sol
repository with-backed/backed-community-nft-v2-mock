// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.12;

contract BackedCommunityNFTMock {
    uint256 public categoryCount;

    struct Category {
        string displayName;
        address art;
    }

    struct CategoryScoreChange {
        address addr;
        uint256 categoryId;
        uint256 score;
    }

    mapping(uint256 => Category) categoryIdToCategory;

    mapping(address => mapping(uint256 => uint256)) addressToCategoryScore;

    function addCategory(Category memory category) public {
        categoryIdToCategory[categoryCount++] = category;
    }

    function setCategoryScores(CategoryScoreChange[] memory changes) public {
        for (uint256 i = 0; i < changes.length; i++) {
            _setCategoryScore(changes[i]);
        }
    }

    function getScoreForAddressAndCategory(address addr, uint256 categoryId)
        public
        view
        returns (uint256)
    {
        return addressToCategoryScore[addr][categoryId];
    }

    function _setCategoryScore(CategoryScoreChange memory change) internal {
        addressToCategoryScore[change.addr][change.categoryId] = change.score;
    }
}
