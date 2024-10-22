// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

uint256 constant NUMERIC_TRAITS_NUM = 6;

struct AavegotchiInfo {
    uint256 tokenId;
    string name;
    address owner;
    uint256 randomNumber;
    uint256 status;
    int16[1] numericTraits;
    int16[1] modifiedNumericTraits;
    uint16[1] equippedWearables;
    address collateral;
    address escrow;
    uint256 stakedAmount;
    uint256 minimumStake;
    uint256 kinship; //The kinship value of this Aavegotchi. Default is 50.
    uint256 lastInteracted;
    uint256 experience; //How much XP this Aavegotchi has accrued. Begins at 0.
    uint256 toNextLevel;
    uint256 usedSkillPoints; //number of skill points used
    uint256 level; //the current aavegotchi level
    uint256 hauntId;
    uint256 baseRarityScore;
    uint256 modifiedRarityScore;
    bool locked;
}

contract Aavegotchi is ERC721PresetMinterPauserAutoId {
    constructor() ERC721PresetMinterPauserAutoId("Aavegotchi", "GOTCHI", "") {}

    function getNumericTraits(uint256 _tokenId)
        external
        view
        returns (int16[NUMERIC_TRAITS_NUM] memory numericTraits_)
    {
        for (uint16 i; i < NUMERIC_TRAITS_NUM; i++) {
            numericTraits_[i] = int16(i);
        }
    }

    function getAavegotchiSvg(uint256 _tokenId)
        public
        view
        returns (string memory ag_)
    {
        return
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g class="gotchi-bg"><defs fill="#fff"><pattern id="a" patternUnits="userSpaceOnUse" width="4" height="4"><path d="M0 0h1v1H0zm2 2h1v1H2z"/></pattern><pattern id="b" patternUnits="userSpaceOnUse" x="0" y="0" width="2" height="2"><path d="M0 0h1v1H0z"/></pattern><pattern id="c" patternUnits="userSpaceOnUse" x="-2" y="0" width="8" height="1"><path d="M0 0h1v1H0zm2 0h1v1H2zm2 0h1v1H4z"/></pattern><pattern id="d" patternUnits="userSpaceOnUse" x="0" y="0" width="4" height="4"><path d="M0 0h1v1H0zm0 2h1v1H0zm1 0V1h1v1zm1 0h1v1H2zm0-1h1V0H2zm1 2h1v1H3z"/></pattern><pattern id="e" patternUnits="userSpaceOnUse" width="64" height="32"><path d="M4 4h1v1H4zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1zm7 0h1v1h-1z"/><path fill="url(#a)" d="M0 8h64v7H0z"/><path fill="url(#b)" d="M0 16h64v1H0z"/><path fill="url(#c)" d="M0 18h64v1H0z"/><path fill="url(#b)" d="M22 18h15v1H22zM0 20h64v3H0z"/><path fill="url(#d)" d="M0 24h64v8H0z"/></pattern><mask id="f"><path fill="url(#e)" d="M0 0h64v32H0z"/></mask></defs><path fill="#fff" d="M0 0h64v32H0z"/><path fill="#dea8ff" class="gotchi-secondary" mask="url(#f)" d="M0 0h64v32H0z"/><path fill="#dea8ff" class="gotchi-secondary" d="M0 32h64v32H0z"/><path mask="url(#f)" fill="#fff" transform="matrix(1 0 0 -1 0 64)" d="M0 0h64v32H0z"/></g><style>.gotchi-primary{fill:#2664BA;}.gotchi-secondary{fill:#D4E0F1;}.gotchi-cheek{fill:#F696C6;}.gotchi-eyeColor{fill:#36818E;}.gotchi-primary-mouth{fill:#2664BA;}.gotchi-sleeves-up{display:none;}.gotchi-handsUp{display:none;}.gotchi-handsDownOpen{display:block;}.gotchi-handsDownClosed{display:none;}</style><g class="gotchi-body"><g class="gotchi-primary"><path d="M21 12h2v-2h-4v2h1z"/><path d="M19 14v-2h-2v2h1zm6-4h2V8h-4v2h1z"/><path d="M29 8h8V6H27v2h1zm16 6h2v-2h-2v1z"/><path d="M48 14h-1v39h-2v2h4V14zm-11-4h4V8h-4v1z"/><path d="M41 12h4v-2h-4v1zM17 53V14h-2v41h4v-2h-1z"/><path d="M24 51h-5v2h5v-1z"/><path d="M27 53h-3v2h5v-2h-1zm18-2h-5v2h5v-1z"/><path d="M35 51h-6v2h6v-1z"/><path d="M38 53h-3v2h5v-2h-1z"/></g><g class="gotchi-secondary"><path d="M18 43v6h2v-1h2v1h2v2h-5v2h-2V14h2v1h-1v26z"/><path d="M27 51h-3v2h5v-2h-1zm11 0h-3v2h5v-2h-1z"/><path d="M35 49h-2v-1h-2v1h-2v2h6v-1zM25 11h2v-1h-4v1h1zm-4 2h2v-1h-4v1h1zm24 31v5h-1v-1h-2v1h-2v2h5v2h2V14h-2v29z"/><path d="M37 8H27v1h5v1h5V9zm8 4h-4v2h4v-1z"/><path d="M41 10h-4v2h4v-1z"/></g><path d="M44 14h-3v-2h-4v-2h-5V9h-5v2h-4v2h-4v2h-1v34h2v-1h2v1h2v2h5v-2h2v-1h2v1h2v2h5v-2h2v-1h2v1h1V14z" fill="#fff"/></g><path class="gotchi-cheek" d="M21 32v2h2v-2h-1zm21 0h-1v2h2v-2z"/><g class="gotchi-primary-mouth"><path d="M29 32h-2v2h2v-1z"/><path d="M33 34h-4v2h6v-2h-1z"/><path d="M36 32h-1v2h2v-2z"/></g><g class="gotchi-shadow"><path opacity=".25" d="M25 58H19v1h1v1h24V59h1V58h-1z" fill="#000"/></g><g class="gotchi-collateral" fill="#2664ba"><path d="M30 15v2h3v1h-3v1h1.5v1h1v-1H34v-3h-3v-1h3v-1h-1.5v-1h-1v1H30zm4 5h1v1h-1z"/><path d="M35 19h1v1h-1z"/><path d="M36 16v3h1v-5h-1v1zm-2-4h1v1h-1z"/><path d="M35 13h1v1h-1zm-7 5v-4h-1v5h1zm1 2h1v1h-1z"/><path d="M28 19h1v1h-1zm1-7h1v1h-1z"/><path d="M28 13h1v1h-1z"/></g><g class="gotchi-eyeColor"><path d="M23 22h-1v1h1v-1zm0 5h-1v1h1v-1zm5-5h-1v1h1v-1zm0 5h-1v1h1v-1zm14 0h-1v1h1v-1zm0-5h-1v1h1v-1zm-5 0h-1v1h1v-1zm0 5h-1v1h1v-1z" class="gotchi-primary" /><g><path d="M25 26h-1v1h1v-1zm2-1h-1v1h1v-1zm-3-1h-1v1h1v-1z" /><path d="M25 23h-1v1h1v-1z" /><path d="M25 24h-1v1h1v-1zm2 0h-1v1h1v-1zm-1 2h-1v1h1v-1z" /><path d="M25 25h-1v1h1v-1z" /><path d="M26 25h-1v1h1v-1zm-2 0h-1v1h1v-1zm2-2h-1v1h1v-1z" /><path d="M26 24h-1v1h1v-1zm13 2h-1v1h1v-1zm2-1h-1v1h1v-1zm-3-1h-1v1h1v-1z" /><path d="M39 24h-1v1h1v-1z" /><path d="M38 23h1v1h-1m0 1h-1v1h1v-1zm2 1h-1v1h1v-1z" /><path d="M40 25h-1v1h1v-1z" /><path d="M39 25h-1v1h1v-1zm2-1h-1v1h1v-1z" /><path d="M40 23h-1v1h1v-1z" /><path d="M40 24h-1v1h1v-1z" /></g></g><g class="gotchi-wearable wearable-body"><svg x="15" y="40"><path d="M20 1V0h-6v1H0v14h4v-2h5v2h5v-2h6v2h5v-2h5v2h4V1H20z" fill="#001e6e"/><g fill="#334b8b"><path d="M14 5V4H4v3H3v1H1v5h3v-2h5v2h5v-2h2V5h-2z"/><path d="M3 5V4H1v3h2V5zm15 1V5h-1v3h1V6zm14-2h-1v3h2V4h-1z"/><path d="M30 6V4H20v1h-1v3h-1v1h-1v2h3v2h5v-2h5v2h3V8h-2V7h-1V6z"/></g><path d="M14 12V7h-1v1h-1v1h-1V8h-1V7H9v6H8v2h7v-2h-1v-1z" fill="#4b2d00"/><path d="M13 7v1h-1v1h-1V8h-1V7H9v6h1v-1h3v1h1V7h-1z" fill="#a97955"/><path d="M11 9v3h1V9h-1z" fill="#8b4b1a"/><path d="M13 9h1v1h-1zM9 9h1v1H9zm4 2h1v1h-1zm-4 0h1v1H9z" fill="#e4c599"/><path d="M25 12V7h-1v1h-1v1h-1V8h-1V7h-1v6h-1v2h7v-2h-1v-1z" fill="#4b2d00"/><path d="M24 7v1h-1v1h-1V8h-1V7h-1v6h1v-1h3v1h1V7h-1z" fill="#a97955"/><path d="M22 9v3h1V9h-1z" fill="#8b4b1a"/><path d="M24 9h1v1h-1zm-4 0h1v1h-1zm4 2h1v1h-1zm-4 0h1v1h-1z" fill="#e4c599"/><path d="M21 2V1h-1V0h-6v1h-1v1H1v1h12v1h1v1h4 0 1 0 1V4h1V3h12V2H21z" fill="#4b2d00"/><path d="M21 2v1h2V2h-2zM11 2v1h2V2h-2zM3 2v1h2V2H3zm4 0v1h2V2H7zm18 0v1h2V2h-2zm4 0v1h2V2h-2zM14 1v3h6V1h-6zm2 2V2h2v1h-2z" fill="#a97955"/><path d="M15 2h1v1h-1zm3 0h1v1h-1z" fill="#e4c599"/></svg></g><g class="gotchi-handsDownClosed"><g class="gotchi-primary"><path d="M19 42h1v1h-1zm1-6h1v1h-1z"/><path d="M21 37h1v1h-1zm5 3v4h1v-4zm-5 3h-1v1h2v-1z"/><path d="M24 44h-2v1h4v-1h-1zm1-5h-1v1h2v-1z"/><path d="M23 38h-1v1h2v-1z"/></g><g class="gotchi-secondary"><path d="M19 43h1v1h-1zm5 2h-2v1h4v-1h-1z"/><path d="M27 41v3h1v-3zm-6 3h-1v1h2v-1z"/><path d="M26 44h1v1h-1zm-7-3h-1v2h1v-1z"/></g><g class="gotchi-primary"><path d="M44 42h1v1h-1zm-1-6h1v1h-1z"/><path d="M42 37h1v1h-1z"/><path d="M42 39v-1h-2v1h1zm0 4v1h2v-1h-1z"/><path d="M40 44h-2v1h4v-1h-1z"/><path d="M38 42v-2h-1v4h1v-1z"/><path d="M40 40v-1h-2v1h1z"/></g><g class="gotchi-secondary"><path d="M42 44v1h2v-1h-1zm-5-2v-1h-1v3h1v-1z"/><path d="M40 45h-2v1h4v-1h-1z"/><path d="M37 44h1v1h-1zm7-1h1v1h-1z"/></g></g><g class="gotchi-handsDownOpen"><g class="gotchi-primary"><path d="M14 40h1v1h-1v-1zm-1-6h1v1h-1v-1z"/><path d="M14 33h1v1h-1v-1zm-2 2h1v1h-1v-1zm-5 3h1v4H7v-4zm5 3h2v1h-2v-1z"/><path d="M8 42h4v1H8v-1zm0-5h2v1H8v-1z"/><path d="M10,36h2v1h-2V36z"/></g><g class="gotchi-secondary"><path d="M14,39h1v1h-1V39z"/><path d="M12,40h2v1h-2V40z"/><path d="M8,41h4v1H8V41z"/></g><path d="M8,38v3h4v-1h2v-1h1v-5h-1v1h-1v1h-1v1h-2v1H8z" fill="#fff" /><g class="gotchi-primary"><path d="M49 40h1v1h-1v-1zm1-6h1v1h-1v-1z"/><path d="M49 33h1v1h-1v-1zm2 2h1v1h-1v-1zm5 3h1v4h-1v-4zm-6 3h2v1h-2v-1z"/><path d="M52 42h4v1h-4v-1zm2-5h2v1h-2v-1z"/><path d="M52,36h2v1h-2V36z"/></g><g class="gotchi-secondary"><path d="M49,39h1v1h-1V39z"/><path d="M50,40h2v1h-2V40z"/><path d="M52,41h4v1h-4V41z"/></g><path d="M54,38v-1h-2v-1h-1v-1h-1v-1h-1v5h1v1h2v1h4v-3H54z" fill="#fff" /></g><g class="gotchi-handsUp"><g class="gotchi-secondary"><path d="M50,38h1v1h-1V38z"/><path d="M49 39h1v1h-1v-1zm2-2h1v1h-1v-1z"/><path d="M52,36h2v1h-2V36z"/><path d="M54,35h2v1h-2V35z"/></g><path d="M52,32v1h-2v1h-1v5h1v-1h1v-1h1v-1h2v-1h2v-3H52z" fill="#fff"/><g class="gotchi-primary"><path d="M49,33h1v1h-1V33z"/><path d="M50 32h2v1h-2v-1zm0 7h1v1h-1v-1z"/><path d="M49 40h1v1h-1v-1zm2-2h1v1h-1v-1z"/><path d="M52 37h2v1h-2v-1zm0-6h4v1h-4v-1z"/><path d="M56,32h1v4h-1V32z"/><path d="M54,36h2v1h-2V36z"/></g><g class="gotchi-secondary"><path d="M13,38h1v1h-1V38z"/><path d="M14 39h1v1h-1v-1zm-2-2h1v1h-1v-1z"/><path d="M10,36h2v1h-2V36z"/><path d="M8,35h2v1H8V35z"/></g><path d="M8,32v3h2v1h2v1h1v1h1v1h1v-5h-1v-1h-2v-1H8z" fill="#fff"/><g class="gotchi-primary"><path d="M14,33h1v1h-1V33z"/><path d="M12 32h2v1h-2v-1zm1 7h1v1h-1v-1z"/><path d="M14 40h1v1h-1v-1zm-2-2h1v1h-1v-1z"/><path d="M10 37h2v1h-2v-1zm-2-6h4v1H8v-1z"/><path d="M7,32h1v4H7V32z"/><path d="M8,36h2v1H8V36z"/></g></g><g class="gotchi-wearable wearable-head"><svg x="27" y="0"><path d="M8 6V3H6V0H4v3H2v3H0v13h2v2h2v1h2v-1h2v-2h2V6H8z"/><path d="M4 22h1V0H4v22zm2-1h1V3H6v18zm-4 0h1V3H2v18zm-2-2h1V6H0v13zM8 6v13h1V6H8z" fill="#191919"/></svg></g><g class="gotchi-wearable wearable-hand wearable-hand-left"><svg x="0" y="35"><path d="M15,3V2h-1V1h-1V0h-2v1h-1v1H6V1H5V0H3v1H2v1H1v1H0v3h1v6h1v1h3v-1h1V9h1V8h2v1h1v3h1v1h3v-1h1V6h1V3H15z"/><path d="M7 3h2v1H7V3zm4 8h3v1h-3v-1zm-9 0h3v1H2v-1z" fill="#4b4b4b"/><path d="M14 3V2h-1V1h-2v1h-1v2H9v1H7V4H6V2H5V1H3v1H2v1H1v3h1v4h3V9h1V8H5V6h2v1h2V6h2v2h-1v1h1v1h3V6h1V3h-1zm-1 2h-1V4h1v1z" fill="#969696"/><path d="M6 7h1v1H6V7zm3 0h1v1H9V7zm2-3h1v1h-1V4zm2 0h1v1h-1V4z" fill="#ff14ff"/><path d="M12 3h1v1h-1V3zm0 2h1v1h-1V5zM3 4h1v1H3V4z" fill="#00ffe1"/><path d="M12,4h1v1h-1V4z"/><path d="M13 3h1v1h-1V3zm0 2h1v1h-1V5zm-2 0h1v1h-1V5zm0-2h1v1h-1V3zM3 3h1v1H3V3z"/><path d="M2 4h1v1H2V4zm2 0h1v1H4V4z"/><path d="M3,5h1v1H3V5z"/></svg></g></svg>';
    }
}
