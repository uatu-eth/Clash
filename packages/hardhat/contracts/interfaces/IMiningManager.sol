pragma solidity >=0.8.0 <0.9.0;

interface IMiningManager {
    function boosterOf(uint256 id) external view returns (uint256);

    function radarOf(uint256 id) external view returns (uint8);

    function machineryOf(uint256 id) external view returns (uint256);

    function drillOf(uint256 id, uint256 initialAmount)
        external
        view
        returns (uint256);
}
