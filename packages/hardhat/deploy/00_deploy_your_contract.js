// deploy/00_deploy_your_contract.js

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const cometh = await deploy("Cometh", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });

  const rules = await deploy("SpaceShipsRules", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

  const miningManager = await deploy("MiningManagerV4", {
    from: deployer,
    args: [rules.address],
    log: true,
    waitConfirmations: 5,
  });

  const comethResolver = await deploy("ComethResolver", {
    from: deployer,
    args: [miningManager.address],
    log: true,
    waitConfirmations: 5,
  });

  const orcs = await deploy("EtherOrcsPoly", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });

  const orcsResolver = await deploy("EtherOrcsResolver", {
    from: deployer,
    args: [orcs.address],
    log: true,
    waitConfirmations: 5,
  });

  const aavegotchi = await deploy("Aavegotchi", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });

  const aavegotchiResolver = await deploy("AavegotchiResolver", {
    from: deployer,
    args: [aavegotchi.address],
    log: true,
    waitConfirmations: 5,
  });

  const verifier = await deploy("PlonkVerifier", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

  await deploy("Battler", {
    from: deployer,
    args: [
      300,
      1,
      verifier.address,
      [70, 100, 50],
      [
        comethResolver.address,
        orcsResolver.address,
        aavegotchiResolver.address,
      ],
      [cometh.address, orcs.address, aavegotchi.address],
    ],
    log: true,
    waitConfirmations: 5,
  });
};
module.exports.tags = ["YourContract"];
