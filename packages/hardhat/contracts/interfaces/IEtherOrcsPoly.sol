// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

struct Orc {
    uint8 body;
    uint8 helm;
    uint8 mainhand;
    uint8 offhand;
    uint16 level;
    uint16 zugModifier;
    uint32 lvlProgress;
}

interface IEtherOrcsPoly {
    function orcs(uint256 id)
        external
        view
        returns (
            uint8 body,
            uint8 helm,
            uint8 mainhand,
            uint8 offhand,
            uint16 level,
            uint16 zugModifier,
            uint32 lvlProgress
        );
}
