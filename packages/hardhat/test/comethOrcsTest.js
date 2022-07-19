const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const snarkjs = require("snarkjs");

use(solidity);

describe("Testing resolvers", function () {
  describe("Testing Battler with Cometh and EtherOrcs", function () {
    let owner;
    let battler;
    let cometh;
    let orcs;
    let comethResolver;
    let orcsResolver;

    it("Should deploy contracts", async function () {
      [owner] = await ethers.getSigners();

      const ERC721Factory = await ethers.getContractFactory(
        "ERC721PresetMinterPauserAutoId"
      );

      const RulesFactory = await ethers.getContractFactory("SpaceShipsRules");
      const OrcsFactory = await ethers.getContractFactory("EtherOrcsPoly");

      const ComethResolverFactory = await ethers.getContractFactory(
        "ComethResolver"
      );
      const OrcsResolverFactory = await ethers.getContractFactory(
        "EtherOrcsResolver"
      );
      const VerifierFactory = await ethers.getContractFactory("PlonkVerifier");
      const BattlerFactory = await ethers.getContractFactory("Battler");

      cometh = await ERC721Factory.deploy("Cometh", "COMETH", "");
      orcs = await ERC721Factory.deploy("EtherOrcs", "ORCS", "");

      const rules = await RulesFactory.deploy();
      const etherOrcsPoly = await OrcsFactory.deploy();
      comethResolver = await ComethResolverFactory.deploy(rules.address);
      orcsResolver = await OrcsResolverFactory.deploy(etherOrcsPoly.address);

      const verifier = await VerifierFactory.deploy();
      battler = await BattlerFactory.deploy(
        300,
        1,
        verifier.address,
        [75, 100],
        [comethResolver.address, orcsResolver.address],
        [cometh.address, orcs.address]
      );

      for (let i = 0; i < 75; i += 1) {
        cometh.mint(owner.address);
      }

      for (let i = 0; i < 2; i += 1) {
        orcs.mint(owner.address);
      }
    });

    it("Should return the correct stats 0", async function () {
      expect(await comethResolver.tokenStats(73)).to.deep.equal([
        BigNumber.from(0),
        BigNumber.from(15),
        BigNumber.from(300),
      ]);
    });

    it("Should return the correct stats 0", async function () {
      expect(await orcsResolver.tokenStats(0)).to.deep.equal([
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
      ]);
    });

    it("Should not allow battling before epoch simulated", async function () {
      await expect(
        battler.battle(orcs.address, orcs.address, 0, 1, 0, 0, "0x")
      ).to.be.revertedWith("This epochId has not been simulated yet");
    });

    it("Should allow simulating epochs", async function () {
      await expect(battler.simulateEpoch(0, 2))
        .to.emit(battler, "EpochSimulated")
        .withArgs(0, 2);
    });

    it("Should not allow battling tokens that are not matched", async function () {
      await expect(
        battler.battle(orcs.address, orcs.address, 0, 1, 0, 0, "0x")
      ).to.be.revertedWith("The given tokens are not matched in this epochId.");
    });

    it("Should not allow battling two cometh tokens without a valid proof", async function () {
      await expect(
        battler.battle(cometh.address, cometh.address, 0, 2, 0, 0, "0x")
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should not allow battling a cometh and orc token without a valid proof ", async function () {
      await expect(
        battler.battle(cometh.address, orcs.address, 73, 0, 0, 0, "0x")
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should not allow battling tokens with the wrong winner value", async function () {
      const input = {
        healthA: 0,
        healthB: 0,
        healthPerTurnA: 15,
        healthPerTurnB: 0,
        damageA: 300,
        damageB: 0,
        rand: 2,
      };

      const { proof, publicSignals } = await snarkjs.plonk.fullProve(
        input,
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
          orcs.address,
          73,
          0,
          0,
          0,
          S.split(",")[0]
        )
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should allow battling tokens with the correct winner value", async function () {
      const input = {
        healthA: 0,
        healthB: 0,
        healthPerTurnA: 15,
        healthPerTurnB: 0,
        damageA: 300,
        damageB: 0,
        rand: 2,
      };

      const { proof, publicSignals } = await snarkjs.plonk.fullProve(
        input,
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
          orcs.address,
          73,
          0,
          0,
          1,
          S.split(",")[0]
        )
      )
        .to.emit(battler, "MatchResolved")
        .withArgs(cometh.address, orcs.address, owner.address, 73, 0, 1, 0);
    });
  });
});
