pragma solidity >=0.8.0 <0.9.0;

uint256 constant SKILL_COUNT = 4;

interface IResolver {
    // Health, damage, attackRecoverTime, healthPerTurn
    function tokenStats(uint256 id)
        external
        view
        returns (uint256[SKILL_COUNT] memory stats);
}
