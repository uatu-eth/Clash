import { Battler, Epoch, Token, TokenContract, Owner, Match } from "../generated/schema";
import { AddCollection, BattlerCreation, EpochSimulated, MatchResolved, Transfer } from "../generated/Battler/Battler"
import { ERC721, Transfer as TransferERC721 } from "../generated/ERC721/ERC721";
import { Address, BigInt } from "@graphprotocol/graph-ts";

let ZERO = BigInt.fromI32(0);

export function getOrCreateBattler(
  id: string
): Battler {
  let entity = Battler.load(id);
  if (!entity) {
    entity = new Battler(id);
    entity.globalSupply = ZERO;
    entity.matchInterval = ZERO;
    entity.reward = ZERO;
    entity.startTimestamp = ZERO;
  }

  return entity;
}

export function getOrCreateEpoch(
  id: string
): Epoch {
  let entity = Epoch.load(id);
  if (!entity) {
    entity = new Epoch(id);
  }

  return entity;
}

export function getOrCreateMatch(
  id: string
): Match {
  let entity = Match.load(id);
  if (!entity) {
    entity = new Match(id);
  }

  return entity;
}

export function getOrCreateToken(
  address: Address, tokenId: BigInt
): Token {
  let entity = Token.load(address.toHexString() + "_" + tokenId.toString());
  if (!entity) {
    entity = new Token(address.toHexString() + "_" + tokenId.toString());
    entity.contract = address.toHexString();
    entity.tokenID = tokenId;

    let tokenContract = getOrCreateTokenContract(address);
    entity.tokenIndex = tokenContract.currentTokenIndex;

    tokenContract.currentTokenIndex = tokenContract.currentTokenIndex.plus(BigInt.fromString("1"));
    tokenContract.save();
  }

  return entity;
}

export function getOrCreateTokenContract(
  id: Address
): TokenContract {
  let entity = TokenContract.load(id.toHexString());
  if (!entity) {
    entity = new TokenContract(id.toHexString());
    entity.currentTokenIndex = ZERO;

    let contract = ERC721.bind(id);
    let name = contract.try_name();
    entity.name = normalize(name.value);
  }

  return entity;
}

export function getOrCreateOwner(
  id: string
): Owner {
  let entity = Owner.load(id);
  if (!entity) {
    entity = new Owner(id);
    entity.balance = BigInt.fromString("0");
  }

  return entity;
}

function setCharAt(str: string, index: i32, char: string): string {
  if (index > str.length - 1) return str;
  return str.substr(0, index) + char + str.substr(index + 1);
}

function normalize(strValue: string): string {
  if (strValue.length === 1 && strValue.charCodeAt(0) === 0) {
    return "";
  } else {
    for (let i = 0; i < strValue.length; i++) {
      if (strValue.charCodeAt(i) === 0) {
        strValue = setCharAt(strValue, i, '\ufffd'); // graph-node db does not support string with '\u0000'
      }
    }
    return strValue;
  }
}

export function handleEpochSimulated(event: EpochSimulated): void {
  let entity = getOrCreateEpoch(event.params.epochId.toString());

  entity.random = event.params.random;

  entity.save();
}

export function handleMatchResolved(event: MatchResolved): void {
  let entity = getOrCreateMatch(event.params.homeCollection.toHexString() + "_" + event.params.awayCollection.toHexString() + "_" + event.params.homeTokenId.toString() + "_" + event.params.awayTokenId.toString() + "_" + event.params.epochId.toString());

  entity.epoch = event.params.epochId.toString();
  entity.homeToken = event.params.homeCollection.toHexString() + "_" + event.params.homeTokenId.toString();
  entity.awayToken = event.params.awayCollection.toHexString() + "_" + event.params.awayTokenId.toString();
  entity.winner = event.params.homeVictory.equals(ZERO) ? entity.awayToken : entity.homeToken;

  entity.save();
}

export function handleTransfer(event: Transfer): void {
  let from = getOrCreateOwner(event.params.from.toHexString());
  let to = getOrCreateOwner(event.params.to.toHexString());

  from.balance += event.params.value;
  to.balance += event.params.value;

  from.save();
  to.save();
}

export function handleTransferERC721(event: TransferERC721): void {
  let collection = getOrCreateTokenContract(event.address);
  collection.save();
  let entity = getOrCreateToken(event.address, event.params.tokenId);
  let owner = getOrCreateOwner(event.params.to.toHexString());

  entity.owner = event.params.to.toHexString();

  entity.save();
  owner.save();
}

export function handleBattlerCreation(event: BattlerCreation): void {
  let entity = getOrCreateBattler("0");

  entity.matchInterval = event.params.matchInterval;
  entity.reward = event.params.reward;
  entity.startTimestamp = event.params.startTimestamp;

  entity.save();
}

export function handleAddCollection(event: AddCollection): void {
  let entity = getOrCreateBattler("0");
  let collection = getOrCreateTokenContract(event.params.collection);

  collection.offset = entity.globalSupply;
  collection.resolver = event.params.resolver;
  entity.globalSupply = entity.globalSupply.plus(event.params.supply);

  entity.save();
  collection.save();
}
