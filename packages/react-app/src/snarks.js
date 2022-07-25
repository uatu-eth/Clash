const snarkjs = require("snarkjs");

export const calculateBattleProof = async (homeStats, awayStats, rand) => {
  const input = {
    homeStats,
    awayStats,
    rand,
  };

  const { proof, publicSignals } = await snarkjs.plonk.fullProve(input, "../battle.wasm", "../battle.zkey");

  const S = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

  return [S.split(",")[0], publicSignals];
};
