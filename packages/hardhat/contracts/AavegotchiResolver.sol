pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/IResolver.sol";
import "./interfaces/IAavegotchi.sol";

contract AavegotchiResolver is IResolver {
    IAavegotchi private aavegotchi;

    constructor(IAavegotchi _aavegotchi) {
        aavegotchi = _aavegotchi;
    }

    function tokenStats(uint256 id)
        external
        view
        override
        returns (uint256[SKILL_COUNT] memory stats)
    {
        int16[6] memory traits = aavegotchi.getNumericTraits(id);

        stats[0] = uint256(uint16(traits[0] > 0 ? traits[0] : -traits[0]));
        stats[1] = uint256(uint16(traits[1] > 0 ? traits[1] : -traits[1]));
        stats[2] = uint256(uint16(traits[2] > 0 ? traits[2] : -traits[2]));
        stats[3] = uint256(uint16(traits[3] > 0 ? traits[3] : -traits[3]));
    }
}
