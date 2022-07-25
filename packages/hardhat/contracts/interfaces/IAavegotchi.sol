// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

uint256 constant NUMERIC_TRAITS_NUM = 6;

contract IAavegotchi {
    function getNumericTraits(uint256 _tokenId)
        external
        view
        returns (int16[NUMERIC_TRAITS_NUM] memory numericTraits_)
    {
        for (uint16 i; i < NUMERIC_TRAITS_NUM; i++) {
            numericTraits_[i] = int16(i);
        }
    }
}
