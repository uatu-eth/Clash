pragma solidity >=0.8.0 <0.9.0;

import "../interfaces/IResolver.sol";
import "./cometh/SpaceShipsRules.sol";

contract ComethResolver is IResolver {
    uint256 private constant SKILL_COUNT = 3;
    SpaceShipsRules private rules;

    constructor(SpaceShipsRules _rules) {
        rules = _rules;
    }

    function tokenStats(uint256 id)
        external
        view
        override
        returns (uint256[SKILL_COUNT] memory stats)
    {
        stats[0] = rules.boosterOf(id);
        stats[1] = rules.radarOf(id);
        stats[2] = rules.machineryOf(id);
    }
}
