pragma solidity >=0.8.0 <0.9.0;

interface IResolver {
    function tokenStats(uint256 id)
        external
        view
        returns (uint256[3] memory stats);
}
