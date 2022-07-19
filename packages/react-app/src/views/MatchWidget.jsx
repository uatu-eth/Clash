import { gql, useQuery } from "@apollo/client";
import React from "react";
import { TokenWidget } from "./Tokens";
import { Link } from "react-router-dom";
import { battle } from "./Match";

export const tokenToName = token => `${token.contract.name} #${token.tokenID}`;

export const matchDate = (epochId, battler) =>
  new Date((parseInt(battler.startTimestamp) + epochId * parseInt(battler.matchInterval)) * 1000);

export const MILADY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const AZUKI_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function mod(n, m) {
  return ((n % m) + m) % m;
}

function MatchWidget(props) {
  const EXAMPLE_GRAPHQL = gql`
  query getToken($homeId: ID!, $awayId: ID!, $epoch: String){
    homeToken: token(id: $homeId) {
      id
      contract {
        id
        name
      }
      tokenID
      stats
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
      stats
      owner {
        id
      }
    }
    matches(where: {homeToken:$homeId, epoch: $epoch}) {
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
  const homeContract = parseInt(homeGlobalId) < 75 ? MILADY_ADDRESS.toLowerCase() : AZUKI_ADDRESS.toLowerCase();
  const awayContract = parseInt(awayGlobalId) < 75 ? MILADY_ADDRESS.toLowerCase() : AZUKI_ADDRESS.toLowerCase();

  const homeTokenId = parseInt(homeGlobalId) - (parseInt(homeGlobalId) < 75 ? 0 : 75);
  const awayTokenId = parseInt(awayGlobalId) - (parseInt(awayGlobalId) < 75 ? 0 : 75);

  const homeId = homeContract + "_" + homeTokenId;
  const awayId = awayContract + "_" + awayTokenId;

  console.log((thisGlobalId - parseInt(props.epoch.random)) % parseInt(props.battler.metaSupply));

  const { loading, data, error } = useQuery(EXAMPLE_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      homeId,
      awayId,
      epoch: props.epoch.id
    },
  });

  if (loading || error) {
    return <div>LOADING!</div>;
  }

  const victoryA = battle(
    parseInt(data.homeToken.stats[0]),
    parseInt(data.awayToken.stats[0]),
    parseInt(data.homeToken.stats[1]),
    parseInt(data.awayToken.stats[1]),
    parseInt(data.homeToken.stats[2]),
    parseInt(data.awayToken.stats[2]),
    props.epoch.random,
  );

  return (
    <Link to={`/match/${`${data.homeToken.contract.id}_${data.awayToken.contract.id}`.toLowerCase() + "_" + data.homeToken.tokenID + "_" + data.awayToken.tokenID + "_" + props.epoch.id} `}>
      <div style={{ borderStyle: "solid" }}>
        <div>
          <h2>{matchDate(props.epoch.id, data.battler).toUTCString()}</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TokenWidget p={data.homeToken} write={props.writeContracts} />
            vs
            <TokenWidget p={data.awayToken} write={props.writeContracts} />
          </div>
          <div>
            <div>
              {data.matches.length > 0 ? <div>Resolved | Winner: {tokenToName(data.matches[0].winner)}</div> : <div>Unresolved | Winner: {victoryA === 1 ? tokenToName(data.homeToken) : tokenToName(data.awayToken)} </div>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MatchWidget;
