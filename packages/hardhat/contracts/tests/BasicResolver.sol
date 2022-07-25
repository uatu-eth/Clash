pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IResolver.sol";

contract BasicResolver is IResolver {
    uint256 private constant SKILL_MODULUS = 10;

    function tokenStats(uint256 id)
        external
        view
        override
        returns (uint256[SKILL_COUNT] memory stats)
    {
        for (uint256 i; i < SKILL_COUNT; i++) {
            uint256 baseStat = uint256(keccak256(abi.encode(id, i))) %
                SKILL_MODULUS;

            stats[i] = baseStat;
        }
    }
}
