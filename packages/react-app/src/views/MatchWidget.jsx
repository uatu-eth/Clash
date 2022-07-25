import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useState } from "react";
import { MatchInner } from "./Match";

export const tokenToName = token => `${token.contract.name} #${token.tokenID}`;

export const matchDate = (epochId, battler) =>
  new Date((parseInt(battler.startTimestamp) + epochId * parseInt(battler.matchInterval)) * 1000);

function mod(n, m) {
  return ((n % m) + m) % m;
}

// Fetch the contract that contain these global ID's
const CONTRACTS_GRAPHQL = gql`
  query getContracts($homeGlobalIndex: BigInt, $awayGlobalIndex: BigInt) {
    homeContracts: tokenContracts(orderBy: offset, orderDirection: desc, where: { offset_lte: $homeGlobalIndex }) {
      id
      offset
    }
    awayContracts: tokenContracts(orderBy: offset, orderDirection: desc, where: { offset_lte: $awayGlobalIndex }) {
      id
      offset
    }
  }
`;

const TOKENS_GRAPHQL = gql`
  query getContracts($homeContract: Bytes, $awayContract: Bytes, $homeIndex: BigInt, $awayIndex: BigInt) {
    homeTokens: tokens(where: { contract: $homeContract, tokenIndex: $homeIndex }) {
      id
    }
    awayTokens: tokens(where: { contract: $awayContract, tokenIndex: $awayIndex }) {
      id
    }
  }
`;


function MatchWidget(props) {
  const [homeGlobalIndex, setHomeGlobalIndex] = useState(0);
  const [awayGlobalIndex, setAwayGlobalIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (props.writeContracts.Cometh) {
        const thisGlobalIndex = parseInt(props.p.contract.offset) + parseInt(props.p.tokenIndex);

        const isHome =
          Math.floor(thisGlobalIndex / (parseInt(props.epoch.random) % parseInt(props.battler.globalSupply))) % 2 === 0;
        setHomeGlobalIndex(
          isHome
            ? thisGlobalIndex
            : mod(thisGlobalIndex - parseInt(props.epoch.random), parseInt(props.battler.globalSupply)),
        );
        setAwayGlobalIndex(
          isHome
            ? (thisGlobalIndex + parseInt(props.epoch.random)) % parseInt(props.battler.globalSupply)
            : thisGlobalIndex,
        );
      }
    }
    fetchData();
  }, [
    props.battler.globalSupply,
    props.epoch.random,
    props.p.contract.offset,
    props.p.tokenID,
    props.p.tokenIndex,
    props.writeContracts.Cometh,
  ]);

  const { loading, data } = useQuery(CONTRACTS_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      homeGlobalIndex,
      awayGlobalIndex,
    },
  });

  if (loading) {
    return <div>Loading</div>;
  }

  const homeContract = data.homeContracts[0].id;
  const awayContract = data.awayContracts[0].id;

  const homeIndex = homeGlobalIndex - data.homeContracts[0].offset;
  const awayIndex = awayGlobalIndex - data.awayContracts[0].offset;

  return (
    <WrapperThing
      homeContract={homeContract}
      awayContract={awayContract}
      homeIndex={homeIndex}
      awayIndex={awayIndex}
      epoch={props.epoch}
      writeContracts={props.writeContracts}
      tx={props.tx}
    />
  );
}


function WrapperThing(props) {
  const { loading, data } = useQuery(TOKENS_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      homeContract: props.homeContract,
      awayContract: props.awayContract,
      homeIndex: props.homeIndex,
      awayIndex: props.awayIndex,
    },
  });

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <MatchInner
      id={"id"}
      homeId={data.homeTokens[0].id}
      awayId={data.awayTokens[0].id}
      epochId={props.epoch.id}
      writeContracts={props.writeContracts}
      tx={props.tx}
    />
  );
}

export default MatchWidget;
