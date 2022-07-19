const snarkjs = require("snarkjs");

export const calculateBattleProof = async (homeStats, awayStats, rand) => {
  const input = {
    healthA: homeStats[0],
    healthB: awayStats[0],
    healthPerTurnA: homeStats[1],
    healthPerTurnB: awayStats[1],
    damageA: homeStats[2],
    damageB: awayStats[2],
    rand,
  };

  const { proof, publicSignals } = await snarkjs.plonk.fullProve(input, "../battle.wasm", "../battle.zkey");

  const S = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

  return S.split(",")[0];
};
