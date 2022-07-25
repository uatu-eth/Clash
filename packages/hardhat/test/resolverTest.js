const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const snarkjs = require("snarkjs");

use(solidity);

describe("Testing resolvers", function () {
  describe("BasicResolver", function () {
    let resolver;

    it("Should deploy contracts", async function () {
      const ResolverFactory = await ethers.getContractFactory("BasicResolver");

      resolver = await ResolverFactory.deploy();
    });

    it("Should return the correct stats 0", async function () {
      expect(await resolver.tokenStats(0)).to.deep.equal([
        BigNumber.from(7),
        BigNumber.from(7),
        BigNumber.from(5),
        BigNumber.from(7),
      ]);
    });

    it("Should return the correct stats 1", async function () {
      expect(await resolver.tokenStats(2)).to.deep.equal([
        BigNumber.from(1),
        BigNumber.from(7),
        BigNumber.from(8),
        BigNumber.from(1),
      ]);
    });
  });

  describe("ComethResolver", function () {
    let resolver;

    it("Should deploy contracts", async function () {
      const RulesFactory = await ethers.getContractFactory("SpaceShipsRules");
      const ResolverFactory = await ethers.getContractFactory("ComethResolver");

      const rules = await RulesFactory.deploy();
      resolver = await ResolverFactory.deploy(rules.address);
    });

    it("Should return the correct stats 3", async function () {
      expect(await resolver.tokenStats(3)).to.deep.equal([
        BigNumber.from(15),
        BigNumber.from(100),
        BigNumber.from(5),
        BigNumber.from(0),
      ]);
    });
  });

  describe("EtherOrcsResolver", function () {
    let resolver;

    it("Should deploy contracts", async function () {
      const OrcsFactory = await ethers.getContractFactory("EtherOrcsPoly");
      const ResolverFactory = await ethers.getContractFactory(
        "EtherOrcsResolver"
      );

      const orcs = await OrcsFactory.deploy();
      resolver = await ResolverFactory.deploy(orcs.address);
    });

    it("Should return the correct stats 3", async function () {
      expect(await resolver.tokenStats(3)).to.deep.equal([
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
        BigNumber.from(0),
      ]);
    });
  });

  describe("Testing Basic Battler", function () {
    const rand = 2;
    let battler;
    let erc721;

    it("Should deploy contracts", async function () {
      const [owner] = await ethers.getSigners();

      const ERC721Factory = await ethers.getContractFactory(
        "ERC721PresetMinterPauserAutoId"
      );
      const ResolverFactory = await ethers.getContractFactory("BasicResolver");
      const VerifierFactory = await ethers.getContractFactory("PlonkVerifier");
      const BattlerFactory = await ethers.getContractFactory("Battler");

      erc721 = await ERC721Factory.deploy("Test", "TEST", "");
      const verifier = await VerifierFactory.deploy();
      const resolver = await ResolverFactory.deploy();

      battler = await BattlerFactory.deploy(
        300,
        1,
        verifier.address,
        [100],
        [resolver.address],
        [erc721.address]
      );

      for (let i = 0; i < 3; i += 1) {
        erc721.mint(owner.address);
        erc721.mint(owner.address);
        erc721.mint(owner.address);
      }
    });

    it("Should not allow battling before epoch simulated", async function () {
      await expect(
        battler.battle(erc721.address, erc721.address, 0, 1, 0, 0, "0x")
      ).to.be.revertedWith("This epochId has not been simulated yet");
    });

    it("Should allow simulating epochs", async function () {
      await expect(battler.simulateEpoch(0, 2))
        .to.emit(battler, "EpochSimulated")
        .withArgs(0, rand);
    });

    it("Should not allow battling tokens that are not matched", async function () {
      await expect(
        battler.battle(erc721.address, erc721.address, 0, 1, 0, 0, "0x")
      ).to.be.revertedWith("The given tokens are not matched in this epochId.");
    });

    it("Should not allow battling tokens without a valid proof", async function () {
      await expect(
        battler.battle(erc721.address, erc721.address, 0, 2, 0, 0, "0x")
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should not allow battling tokens with the wrong winner value", async function () {
      const input = {
        homeStats: [7, 7, 5, 7],
        awayStats: [1, 7, 8, 1],
        rand,
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
          erc721.address,
          erc721.address,
          0,
          2,
          0,
          0,
          S.split(",")[0]
        )
      ).to.be.revertedWith("Invalid proof.");
    });

    it("Should allow battling tokens with the correct winner value", async function () {
      const input = {
        homeStats: [7, 7, 5, 7],
        awayStats: [1, 7, 8, 1],
        rand,
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
          erc721.address,
          erc721.address,
          0,
          2,
          0,
          1,
          S.split(",")[0]
        )
      ).to.emit(battler, "MatchResolved");
    });

    it("Should not allow resolving matches twice", async function () {
      await expect(
        battler.battle(erc721.address, erc721.address, 0, 2, 0, 1, "0x")
      ).to.be.revertedWith("This match has already been resolved");
    });
  });
});
