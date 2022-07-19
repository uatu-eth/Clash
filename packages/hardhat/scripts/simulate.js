const { deployments } = require("hardhat");
const { execute } = deployments;

async function main() {
  const from = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

  await execute("Battler", { from, log: true }, "simulateEpoch", 0, 313);

  for (let i = 0; i < 75; i += 1) {
    await execute("Cometh", { from, log: true }, "mint", from);
  }

  for (let i = 0; i < 100; i += 1) {
    await execute("EtherOrcsPoly", { from, log: true }, "mint", from);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
