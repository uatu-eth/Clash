// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./HasRules.sol";

contract MiningManagerV4 is HasRules {
    constructor(address spaceshipsRules) HasRules(spaceshipsRules) {}
}
