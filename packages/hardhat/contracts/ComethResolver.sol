pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IResolver.sol";
import "./interfaces/IMiningManager.sol";

contract ComethResolver is IResolver {
    IMiningManager private miningManager;

    constructor(IMiningManager _miningManager) {
        miningManager = _miningManager;
    }

    function tokenStats(uint256 id)
        external
        view
        override
        returns (uint256[SKILL_COUNT] memory stats)
    {
        stats[0] = miningManager.radarOf(id); // Health <= Mining area
        stats[1] = miningManager.drillOf(id, 100); // Damage <= Mining Power
        stats[2] = miningManager.machineryOf(id) / 60; // Attack Recover Time <= Cooldown / 60
        stats[3] = miningManager.boosterOf(id); // Health Per Turn <= Rover Power
    }
}
