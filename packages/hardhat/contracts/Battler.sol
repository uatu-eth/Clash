pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BattleVerifier.sol";
import "./interfaces/IResolver.sol";

struct Collection {
    bool initialised;
    uint256 offset;
    IResolver resolver;
}

struct Epoch {
    bool simulated;
    uint256 random;
}

contract Battler is ERC20, Ownable {
    uint256 private matchInterval;
    uint256 private reward;
    uint256 private startTimestamp;
    uint256 private globalSupply;
    PlonkVerifier private verifier;

    mapping(uint256 => Epoch) private epochs;
    mapping(IERC721 => Collection) private collections;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool)))
        private resolved;

    event AddCollection(IERC721 collection, IResolver resolver, uint256 supply);
    event BattlerCreation(
        uint256 matchInterval,
        uint256 reward,
        uint256 startTimestamp
    );
    event EpochSimulated(uint256 epochId, uint256 random);
    event MatchResolved(
        IERC721 homeCollection,
        IERC721 awayCollection,
        address winnerOwner,
        uint256 homeTokenId,
        uint256 awayTokenId,
        uint256 homeVictory,
        uint256 epochId
    );

    constructor(
        uint256 _matchInterval,
        uint256 _reward,
        PlonkVerifier _verifier,
        uint256[] memory supplys,
        IResolver[] memory resolvers,
        IERC721[] memory cs
    ) ERC20("Battler", "BATTLE") {
        matchInterval = _matchInterval;
        reward = _reward;
        verifier = _verifier;
        startTimestamp = block.timestamp;

        for (uint256 i; i < cs.length; i++) {
            Collection storage collectionStruct = collections[cs[i]];

            collectionStruct.initialised = true;
            collectionStruct.offset = globalSupply;
            collectionStruct.resolver = resolvers[i];
            globalSupply += supplys[i];

            emit AddCollection(cs[i], resolvers[i], supplys[i]);
        }

        emit BattlerCreation(matchInterval, reward, startTimestamp);
    }

    function simulateEpoch(uint256 epochId, uint256 random) public {
        require(
            block.timestamp >= startTimestamp + (epochId * matchInterval),
            "This epochId has not passed."
        );

        Epoch storage epoch = epochs[epochId];
        require(!epoch.simulated, "This epoch has already been simulated.");

        epoch.simulated = true;
        epoch.random = random;

        emit EpochSimulated(epochId, random);
    }

    function battle(
        IERC721 homeCollection,
        IERC721 awayCollection,
        uint256 homeIndex,
        uint256 awayIndex,
        uint256 epochId,
        uint256 homeVictory,
        bytes memory proof
    ) external {
        uint256 random = epochs[epochId].random;

        require(random != 0, "This epochId has not been simulated yet");

        uint256 homeTokenId = IERC165(homeCollection).supportsInterface(
            type(IERC721Enumerable).interfaceId
        )
            ? IERC721Enumerable(address(homeCollection)).tokenByIndex(homeIndex)
            : homeIndex;
        uint256 awayTokenId = IERC165(awayCollection).supportsInterface(
            type(IERC721Enumerable).interfaceId
        )
            ? IERC721Enumerable(address(awayCollection)).tokenByIndex(awayIndex)
            : awayIndex;
        {
            Collection storage homeStruct = collections[homeCollection];
            require(homeStruct.initialised, "Not a valid homeCollection");

            Collection storage awayStruct = collections[awayCollection];
            require(awayStruct.initialised, "Not a valid awayCollection");

            {
                uint256 homeGlobalIndex = homeIndex + homeStruct.offset;
                uint256 awayGlobalIndex = awayIndex + awayStruct.offset;

                // Each home global ID is mapped to exactly one away global ID
                require(
                    (homeGlobalIndex + random) % globalSupply ==
                        awayGlobalIndex,
                    "The given tokens are not matched in this epochId."
                );

                // Without this check, each token has two battles; one where it is home and one where it is away.
                require(
                    (homeGlobalIndex / (random % globalSupply)) % 2 == 0,
                    "Home global index is not an even multiple of random"
                );

                require(
                    !resolved[homeGlobalIndex][awayGlobalIndex][epochId],
                    "This match has already been resolved"
                );

                resolved[homeGlobalIndex][awayGlobalIndex][epochId] = true;
            }

            {
                uint256[SKILL_COUNT] memory homeStats = homeStruct
                    .resolver
                    .tokenStats(homeTokenId);
                uint256[SKILL_COUNT] memory awayStats = awayStruct
                    .resolver
                    .tokenStats(awayTokenId);

                uint256[] memory pubSignals = new uint256[](10);

                pubSignals[0] = homeVictory;
                pubSignals[1] = homeStats[0];
                pubSignals[2] = homeStats[1];
                pubSignals[3] = homeStats[2];
                pubSignals[4] = homeStats[3];
                pubSignals[5] = awayStats[0];
                pubSignals[6] = awayStats[1];
                pubSignals[7] = awayStats[2];
                pubSignals[8] = awayStats[3];
                pubSignals[9] = random;

                require(
                    verifier.verifyProof(proof, pubSignals),
                    "Invalid proof."
                );
            }
        }

        {
            IERC721 winnerCollection;
            uint256 winnerTokenId;

            if (homeVictory == 1) {
                winnerCollection = homeCollection;
                winnerTokenId = homeTokenId;
            } else {
                winnerCollection = awayCollection;
                winnerTokenId = awayTokenId;
            }

            address winnerOwner = winnerCollection.ownerOf(winnerTokenId);
            _mint(winnerOwner, reward);

            emit MatchResolved(
                homeCollection,
                awayCollection,
                winnerOwner,
                homeTokenId,
                awayTokenId,
                homeVictory,
                epochId
            );
        }
    }

    function tokenStats(IERC721 collection, uint256 tokenId)
        external
        view
        returns (uint256[SKILL_COUNT] memory)
    {
        return collections[collection].resolver.tokenStats(tokenId);
    }
}
