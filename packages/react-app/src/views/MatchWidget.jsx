import { gql, useQuery } from "@apollo/client";
import React from "react";
import { TokenWidget } from "./Tokens";
import { Link } from "react-router-dom";
import { battle } from "./Match";
import { useEffect } from "react";
import { useState } from "react";

export const tokenToName = token => `${token.contract.name} #${token.tokenID}`;

export const matchDate = (epochId, battler) =>
  new Date((parseInt(battler.startTimestamp) + epochId * parseInt(battler.matchInterval)) * 1000);

export const COMETH_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
export const ORCS_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";

function mod(n, m) {
  return ((n % m) + m) % m;
}

const MATCH_GRAPHQL = gql`
  query getToken($homeId: ID!, $awayId: ID!, $epoch: String){
    homeToken: token(id: $homeId) {
      id
      contract {
        id
        name
      }
      tokenID
      owner {
        id
      }
    }
    awayToken: token(id: $awayId) {
      id
      contract {
        id
        name
      }
      tokenID
      owner {
        id
      }
    }
    matches(where: { homeToken: $homeId, epoch: $epoch }) {
      id
      winner {
        id
        tokenID
        contract {
          id
          name
        }
      }
    }
    battler(id: 0) {
      id
      matchInterval
      reward
      startTimestamp
    }
  }
  `;

function MatchWidget(props) {
  const [homeStats, setHomeStats] = useState(["...", "...", "..."]);
  const [awayStats, setAwayStats] = useState(["...", "...", "..."]);

  // Loop through collections until we find the tokenID that fits this offset.
  const thisGlobalId = parseInt(props.p.contract.offset) + parseInt(props.p.tokenID);

  // We need to decouple MatchWidget from a specific token
  // If it's an even multiple, this is the home token
  const isEvenMultiple = Math.floor(thisGlobalId / (parseInt(props.epoch.random) % parseInt(props.battler.metaSupply))) % 2 === 0;
  const homeGlobalId = isEvenMultiple ? thisGlobalId : (mod((thisGlobalId - parseInt(props.epoch.random)), parseInt(props.battler.metaSupply))).toString();
  const awayGlobalId = isEvenMultiple
    ? ((thisGlobalId + parseInt(props.epoch.random)) % parseInt(props.battler.metaSupply)).toString()
    : thisGlobalId;

  //If greater than or equal to Azuki offset, it is an Azuki
  const homeContract = parseInt(homeGlobalId) < 75 ? COMETH_ADDRESS.toLowerCase() : ORCS_ADDRESS.toLowerCase();
  const awayContract = parseInt(awayGlobalId) < 75 ? COMETH_ADDRESS.toLowerCase() : ORCS_ADDRESS.toLowerCase();

  const homeTokenId = parseInt(homeGlobalId) - (parseInt(homeGlobalId) < 75 ? 0 : 75);
  const awayTokenId = parseInt(awayGlobalId) - (parseInt(awayGlobalId) < 75 ? 0 : 75);

  const homeId = homeContract + "_" + homeTokenId;
  const awayId = awayContract + "_" + awayTokenId;

  useEffect(() => {
    async function fetchData() {
      if (data && data.homeToken && props.writeContracts.Battler) {
        props.writeContracts.Battler.tokenStats(data.homeToken.contract.id, data.homeToken.tokenID).then(x => setHomeStats(x));
        props.writeContracts.Battler.tokenStats(data.awayToken.contract.id, data.awayToken.tokenID).then(x => setAwayStats(x));
      }
    }
    fetchData();
  }, [props.writeContracts.Battler]);

  const { loading, data, error } = useQuery(MATCH_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      homeId,
      awayId,
      epoch: props.epoch.id,
    },
  });

  if (loading) {
    return <div>LOADING!</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const victoryA = battle(
    parseInt(homeStats[0]),
    parseInt(awayStats[0]),
    parseInt(homeStats[1]),
    parseInt(awayStats[1]),
    parseInt(homeStats[2]),
    parseInt(awayStats[2]),
    props.epoch.random,
  );

  return (
    <Link to={`/match/${`${data.homeToken.contract.id}_${data.awayToken.contract.id}`.toLowerCase() + "_" + data.homeToken.tokenID + "_" + data.awayToken.tokenID + "_" + props.epoch.id} `}>
      <div style={{ borderStyle: "solid" }}>
        <div>
          <h2>{matchDate(props.epoch.id, data.battler).toUTCString()}</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TokenWidget p={data.homeToken} writeContracts={props.writeContracts} />
            vs
            <TokenWidget p={data.awayToken} writeContracts={props.writeContracts} />
          </div>
          <div>
            <div>
              {data.matches.length > 0 ? (
                <div>Resolved | Winner: {tokenToName(data.matches[0].winner)}</div>
              ) : (
                <div>
                  Unresolved | Predicted Winner: {victoryA === 1 ? tokenToName(data.homeToken) : tokenToName(data.awayToken)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MatchWidget;
