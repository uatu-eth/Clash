// deploy/00_deploy_your_contract.js

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const cometh = await deploy("ERC721PresetMinterPauserAutoId", {
    from: deployer,
    args: ["Cometh", "COMETH", ""],
    log: true,
    waitConfirmations: 5,
  });

  const rules = await deploy("SpaceShipsRules", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

  const comethResolver = await deploy("ComethResolver", {
    from: deployer,
    args: [rules.address],
    log: true,
    waitConfirmations: 5,
  });

  const orcs = await deploy("ERC721PresetMinterPauserAutoId", {
    from: deployer,
    args: ["EthersOrcs", "ORCS", ""],
    log: true,
    waitConfirmations: 5,
  });

  const orcsResolver = await deploy("EtherOrcsResolver", {
    from: deployer,
    args: [orcs.address],
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
      [75, 100],
      [comethResolver.address, orcsResolver.address],
      [cometh.address, orcs.address],
    ],
    log: true,
    waitConfirmations: 5,
  });
};
module.exports.tags = ["YourContract"];
