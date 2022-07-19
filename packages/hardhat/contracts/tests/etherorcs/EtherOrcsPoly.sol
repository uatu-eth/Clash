// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

struct Orc {
    uint8 body;
    uint8 helm;
    uint8 mainhand;
    uint8 offhand;
    uint16 level;
    uint16 zugModifier;
    uint32 lvlProgress;
}

contract EtherOrcsPoly {
    mapping(uint256 => Orc) public orcs;
}
