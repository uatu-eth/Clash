import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { TokenWidget } from "./Tokens";
import { Button } from "antd";
import { calculateBattleProof } from "../snarks.js"
import { useLocation } from "react-router-dom";
import { tokenToName } from "./MatchWidget";
import { mimcHash } from "@darkforest_eth/hashing";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import bigInt from "big-integer";

const nRounds = 10;

export const battle = (homeStats, awayStats, rand) => {
  const transcript = [];
  const healthsA = new Array(nRounds);
  const healthsB = new Array(nRounds);

  // Prevent underflow
  healthsA[0] = homeStats[0] + 100000;
  healthsB[0] = awayStats[0] + 100000;

  // const homeRand = mimcHash(0)(rand);
  // const awayRand = mimcHash(0)(rand + 1);

  for (var i = 1; i < nRounds; i++) {
    const homeRound = i % homeStats[2] === 0 ? 1 : 0;
    const awayRound = i % awayStats[2] === 0 ? 1 : 0;

    healthsA[i] = healthsA[i - 1] + homeStats[3] - awayStats[1] * awayRound;
    healthsB[i] = healthsB[i - 1] + awayStats[3] - homeStats[1] * homeRound;

    transcript.push(`Home token +${homeStats[3]}, -${awayStats[1] * awayRound}. New health: ${healthsA[i]}. Away token +${awayStats[3]}, -${homeStats[1] * homeRound}. New health: ${healthsB[i]}`);
  }

  return [healthsA[nRounds - 1] > healthsB[nRounds - 1] ? 1 : 0, transcript];
};

const MATCH_GRAPHQL = gql`
  query getToken($id: ID, $homeId: ID, $awayId: ID, $epochId: ID){
    match(id: $id) {
      id
      epoch {
        id
      }
      winner {
        id
        tokenID
        contract {
          id
          name
        }
        owner {
          id
        }
      }
    }
    epoch(id: $epochId) {
      id
      random
    }
    battler(id: 0) {
      id
      matchInterval
      globalSupply
      reward
      startTimestamp
    }
    homeToken: token(id: $homeId) {
      id
      contract {
        id
        name
        offset
      }
      tokenID
      tokenIndex
      owner {
        id
      }
    }
    awayToken: token(id: $awayId) {
      id
      contract {
        id
        name
        offset
      }
      tokenID
      tokenIndex
      owner {
        id
      }
    }
  }
  `;

function Match(props) {
  const location = useLocation();
  const id = location.pathname.split("/")[2].replace(" ", "");
  const arr = id.split("_");
  const homeId = arr[0] + "_" + arr[2];
  const awayId = arr[1] + "_" + arr[3];
  const epochId = arr[4];

  return (
    <MatchInner homeId={homeId} awayId={awayId} epochId={epochId} writeContracts={props.writeContracts} tx={props.tx} />
  );
}

export function MatchInner(props) {
  const [homeStats, setHomeStats] = useState(["...", "...", "..."]);
  const [awayStats, setAwayStats] = useState(["...", "...", "..."]);


  const homeSplit = props.homeId.split("_");
  const awaySplit = props.awayId.split("_");
  const id = homeSplit[0] + "_" + awaySplit[0] + "_" + homeSplit[1] + "_" + awaySplit[1] + "_" + props.epochId

  const { loading, data } = useQuery(MATCH_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      id,
      homeId: props.homeId,
      awayId: props.awayId,
      epochId: props.epochId,
    },
  });
  useEffect(() => {
    async function fetchData() {
      if (data && data.homeToken && props.writeContracts.Battler) {
        props.writeContracts.Battler.tokenStats(data.homeToken.contract.id, data.homeToken.tokenID).then(x => setHomeStats(x));
        props.writeContracts.Battler.tokenStats(data.awayToken.contract.id, data.awayToken.tokenID).then(x => setAwayStats(x));
      }
    }
    fetchData();
  }, [data, props.writeContracts.Battler]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const matchResultInfo = battle(
    homeStats.map(s => parseInt(s)),
    awayStats.map(s => parseInt(s)),
    data.epoch.random,
  );

  return (
    <div style={{ borderStyle: "solid" }}>
      {loading ? null
        : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: 'center' }}>
              <Link to={`/token/${data.homeToken.id}`}>
                <TokenWidget p={data.homeToken} writeContracts={props.writeContracts} />
              </Link>
              vs
              <Link to={`/token/${data.awayToken.id}`}>
                <TokenWidget p={data.awayToken} writeContracts={props.writeContracts} />
              </Link>

            </div>
            {data.match ? <div>
              Resolved | Winner: {tokenToName(data.match.winner)}
            </div>
              :
              <div>
                <div>Unresolved | Predicted Winner: {matchResultInfo[0] === 1 ? tokenToName(data.homeToken) : tokenToName(data.awayToken)} </div>
                <Button
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    console.log("generating PROOF")
                    // This is a bit glitchy and slow
                    const [proof, publicSignals] = await calculateBattleProof(homeStats.map(s => parseInt(s)), awayStats.map(s => parseInt(s)), data.epoch.random);

                    props.tx(
                      await props.writeContracts.Battler.battle(
                        data.homeToken.contract.id,
                        data.awayToken.contract.id,
                        data.homeToken.tokenIndex,
                        data.awayToken.tokenIndex,
                        data.epoch.id,
                        publicSignals[0],
                        proof,
                      ),
                    )
                  }}
                >
                  Resolve
                </Button>
              </div>
            }
            <div>
              <ol>
                {matchResultInfo[1].map(s => <li>{s}</li>)}
              </ol>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default Match;
