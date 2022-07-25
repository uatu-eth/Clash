pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IResolver.sol";
import "./interfaces/IEtherOrcsPoly.sol";

contract EtherOrcsResolver is IResolver {
    IEtherOrcsPoly private etherOrcsPoly;

    constructor(IEtherOrcsPoly _etherOrcsPoly) {
        etherOrcsPoly = _etherOrcsPoly;
    }

    function tokenStats(uint256 id)
        external
        view
        override
        returns (uint256[SKILL_COUNT] memory stats)
    {
        (
            uint8 body,
            uint8 helm,
            uint8 mainhand,
            uint8 offhand,
            ,
            ,

        ) = etherOrcsPoly.orcs(id);

        stats[0] = body;
        stats[1] = helm;
        stats[2] = mainhand;
        stats[3] = offhand;
    }
}
