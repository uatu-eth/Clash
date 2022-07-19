const snarkjs = require("snarkjs");

export const calculateBattleProof = async (token1, token2, rand) => {
  const input = {
    healthA: token1.stats[0],
    healthB: token2.stats[0],
    healthPerTurnA: token1.stats[1],
    healthPerTurnB: token2.stats[1],
    damageA: token1.stats[2],
    damageB: token2.stats[2],
    rand,
  };

  const { proof, publicSignals } = await snarkjs.plonk.fullProve(input, "../battle.wasm", "../battle.zkey");

  const S = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

  return S.split(",")[0];
};
