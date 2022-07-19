// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SpaceShipsRules is Ownable {
    uint32 constant ID_TO_MODEL = 1000000;

    uint256 private _baseMiningArea = 15;
    uint256 private _baseMachinery = 300;

    int32 public defaultRotationSpeed = 3;

    mapping(uint256 => uint256) private _booster;
    mapping(uint256 => uint256) private _radar;
    mapping(uint256 => uint256) private _drill;
    mapping(uint256 => uint256) private _machinery;

    constructor() public {}

    function makeRule(
        uint256 model,
        uint256 booster,
        uint256 radar,
        uint256 drill,
        uint256 machinery
    ) external onlyOwner {
        _booster[model] = booster;
        _radar[model] = radar;
        _drill[model] = drill;
        _machinery[model] = machinery;
    }

    function updateDefaultRotationSpeed(int32 speed) external onlyOwner {
        defaultRotationSpeed = speed;
    }

    function updateMachinery(uint256 newBaseMachinery) external onlyOwner {
        _baseMachinery = newBaseMachinery;
    }

    function updateMiningArea(uint8 newBaseMiningArea) external onlyOwner {
        _baseMiningArea = newBaseMiningArea;
    }

    function boosterOf(uint256 id) public view returns (uint256) {
        return _booster[_idToModel(id)];
    }

    function radarOf(uint256 id) public view returns (uint8) {
        if (_radar[_idToModel(id)] == 0) {
            return uint8(_baseMiningArea);
        }
        return uint8((_baseMiningArea * _radar[_idToModel(id)]) / 100);
    }

    function drillOf(uint256 id, uint256 initialAmount)
        public
        view
        returns (uint256)
    {
        if (_drill[_idToModel(id)] == 0) {
            return initialAmount;
        }
        return (initialAmount * _drill[_idToModel(id)]) / 100;
    }

    function machineryOf(uint256 id) public view returns (uint256) {
        if (_machinery[_idToModel(id)] == 0) {
            return _baseMachinery;
        }
        return (_baseMachinery * _machinery[_idToModel(id)]) / 100;
    }

    function _idToModel(uint256 id) internal pure returns (uint256) {
        return id / ID_TO_MODEL;
    }
}
