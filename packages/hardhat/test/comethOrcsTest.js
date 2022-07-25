const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const snarkjs = require("snarkjs");

use(solidity);

const INPUT = {
  homeStats: [15, 100, 5, 100],
  awayStats: [0, 0, 0, 0],
  rand: 2,
};

describe("Testing resolvers", function () {
  describe("Testing Battler with Cometh and EtherOrcs", function () {
    let owner;
    let battler;
    let cometh;
    let etherOrcsPoly;
    let comethResolver;
    let orcsResolver;

    it("Should deploy contracts", async function () {
      [owner] = await ethers.getSigners();

      /* Cometh Setup */
      const ComethFactory = await ethers.getContractFactory("Cometh");
      const SpaceShipsRulesFactory = await ethers.getContractFactory(
        "SpaceShipsRules"
      );
      const MiningManagerFactory = await ethers.getContractFactory(
        "MiningManagerV4"
      );

      cometh = await ComethFactory.deploy();

      const rules = await SpaceShipsRulesFactory.deploy();
      await rules.makeRule(1, 100, 0, 0, 0);

      const miningManager = await MiningManagerFactory.deploy(rules.address);

      /* EtherOrcs Setup */
      const OrcsFactory = await ethers.getContractFactory("EtherOrcsPoly");

      etherOrcsPoly = await OrcsFactory.deploy();

      const ComethResolverFactory = await ethers.getContractFactory(
        "ComethResolver"
      );
      const OrcsResolverFactory = await ethers.getContractFactory(
        "EtherOrcsResolver"
      );
      const VerifierFactory = await ethers.getContractFactory("PlonkVerifier");
      const BattlerFactory = await ethers.getContractFactory("Battler");

      comethResolver = await ComethResolverFactory.deploy(
        miningManager.address
      );
      orcsResolver = await OrcsResolverFactory.deploy(etherOrcsPoly.address);

      const verifier = await VerifierFactory.deploy();
      battler = await BattlerFactory.deploy(
        300,
        1,
        verifier.address,
        [75, 100],
        [comethResolver.address, orcsResolver.address],
        [cometh.address, etherOrcsPoly.address]
      );

      for (let i = 0; i < 75; i += 1) {
        cometh.safeMint(owner.address);
      }

      for (let i = 0; i < 2; i += 1) {
        etherOrcsPoly.safeMint(owner.address);
      }
    });

    it("tokenByIndex should work", async function () {
      expect(await cometh.tokenByIndex(73)).to.deep.equal(1000073);
    });

    it("Should return the correct stats 0", async function () {
      expect(await comethResolver.tokenStats(1000073)).to.deep.equal([
        BigNumber.from(15),
        BigNumber.from(100),
        BigNumber.from(5),
        BigNumber.from(100),
      ]);
    });

    it("Should return the correct stats 0", async function () {
      expect(await orcsResolver.tokenStats(0)).to.deep.equal([
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
      ]);
    });

    it("Should not allow battling before epoch simulated", async function () {
      await expect(
        battler.battle(
          etherOrcsPoly.address,
          etherOrcsPoly.address,
          0,
          1,
          0,
          0,
          "0x"
        )
      ).to.be.revertedWith("This epochId has not been simulated yet");
    });

    it("Should allow simulating epochs", async function () {
      await expect(battler.simulateEpoch(0, 2))
        .to.emit(battler, "EpochSimulated")
        .withArgs(0, 2);
    });

    it("Should not allow battling tokens that are not matched", async function () {
      await expect(
        battler.battle(
          etherOrcsPoly.address,
          etherOrcsPoly.address,
          0,
          1,
          0,
          0,
          "0x"
        )
      ).to.be.revertedWith("The given tokens are not matched in this epochId.");
    });

    it("Should not allow battling two cometh tokens without a valid proof", async function () {
      await expect(
        battler.battle(cometh.address, cometh.address, 0, 2, 0, 0, "0x")
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should not allow battling a cometh and orc token without a valid proof ", async function () {
      await expect(
        battler.battle(cometh.address, etherOrcsPoly.address, 73, 0, 0, 0, "0x")
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should not allow battling tokens with the wrong winner value", async function () {
      const { proof, publicSignals } = await snarkjs.plonk.fullProve(
        INPUT,
        "./artifacts/circom/battle.wasm",
        "./artifacts/circom/battle.zkey"
      );

      const S = await snarkjs.plonk.exportSolidityCallData(
        proof,
        publicSignals
      );

      await expect(
        battler.battle(
          cometh.address,
          etherOrcsPoly.address,
          73,
          0,
          0,
          0,
          S.split(",")[0]
        )
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should allow battling tokens with the correct winner value", async function () {
      const { proof, publicSignals } = await snarkjs.plonk.fullProve(
        INPUT,
        "./artifacts/circom/battle.wasm",
        "./artifacts/circom/battle.zkey"
      );

      const S = await snarkjs.plonk.exportSolidityCallData(
        proof,
        publicSignals
      );

      await expect(
        battler.battle(
          cometh.address,
          etherOrcsPoly.address,
          73,
          0,
          0,
          1,
          S.split(",")[0]
        )
      )
        .to.emit(battler, "MatchResolved")
        .withArgs(
          cometh.address,
          etherOrcsPoly.address,
          owner.address,
          1000073,
          0,
          1,
          0
        );
    });
  });
});
