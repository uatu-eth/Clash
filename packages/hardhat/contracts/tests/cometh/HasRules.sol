// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SpaceShipsRules.sol";

abstract contract HasRules is Ownable {
    SpaceShipsRules private _rules;

    event RulesChanged(address indexed previousRules, address indexed newRules);

    constructor(address rules) internal {
        changeRules(rules);
    }

    function defaultRotationSpeed() public view returns (int32) {
        return _rules.defaultRotationSpeed();
    }

    function boosterOf(uint256 id) public view returns (uint256) {
        return _rules.boosterOf(id);
    }

    function radarOf(uint256 id) public view returns (uint8) {
        return _rules.radarOf(id);
    }

    function drillOf(uint256 id, uint256 initialAmount)
        public
        view
        returns (uint256)
    {
        return _rules.drillOf(id, initialAmount);
    }

    function machineryOf(uint256 id) public view returns (uint256) {
        return _rules.machineryOf(id);
    }

    function changeRules(address newRules) public virtual onlyOwner {
        emit RulesChanged(address(_rules), newRules);
        _rules = SpaceShipsRules(newRules);
    }
}
