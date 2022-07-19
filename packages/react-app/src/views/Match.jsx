import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { TokenWidget } from "./Tokens";
import { Button } from "antd";
import { calculateBattleProof } from "../snarks.js"
import { useLocation } from "react-router-dom";
import { tokenToName } from "./MatchWidget";
import { mimcHash } from "@darkforest_eth/hashing";
import bigInt from "big-integer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const n = 50;

export const battle = (healthA, healthB, healthPerTurnA, healthPerTurnB, damageA, damageB, rand) => {
  const healthsA = new Array(n);
  const healthsB = new Array(n);
  const isHitA = new Array(n);
  const isHitB = new Array(n);
  const hashA = new Array(n);
  const hashB = new Array(n);

  // Prevent underflow
  healthsA[0] = healthA + 100000;
  healthsB[0] = healthB + 100000;

  hashA[0] = mimcHash(0)(rand);
  hashB[1] = mimcHash(0)(rand + 1);

  for (var i = 1; i < n; i++) {
    hashA[i] = mimcHash(0)(hashA[i - 1]);
    hashB[i] = mimcHash(0)(hashB[i - 1]);

    isHitA[i] = hashA[i].mod(2).eq(bigInt(0)) ? 1 : 0;
    isHitB[i] = hashB[i].mod(2).eq(bigInt(0)) ? 1 : 0;

    healthsA[i] = healthsA[i - 1] + healthPerTurnA - damageB * isHitA[i];
    healthsB[i] = healthsB[i - 1] + healthPerTurnB - damageA * isHitB[i];
  }

  return healthsA[n - 1] > healthsB[n - 1] ? 1 : 0;
};

const MATCH_GRAPHQL = gql`
  query getToken($id: ID, $homeId: ID, $awayId: ID,$epochId: ID){
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
      metaSupply
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
      owner {
        id
      }
    }
  }
  `;

function Match(props) {
  const [homeStats, setHomeStats] = useState(["...", "...", "..."]);
  const [awayStats, setAwayStats] = useState(["...", "...", "..."]);

  const location = useLocation();
  const id = location.pathname.split("/")[2].replace(" ", "");
  const arr = id.split("_");
  const homeId = arr[0] + "_" + arr[2];
  const awayId = arr[1] + "_" + arr[3];
  const epochId = arr[4];

  useEffect(() => {
    async function fetchData() {
      if (data && data.homeToken && props.writeContracts.Battler) {
        props.writeContracts.Battler.tokenStats(data.homeToken.contract.id, data.homeToken.tokenID).then(x => setHomeStats(x));
        props.writeContracts.Battler.tokenStats(data.awayToken.contract.id, data.awayToken.tokenID).then(x => setAwayStats(x));
      }
    }
    fetchData();
  }, [props.writeContracts.Battler]);

  const { loading, data } = useQuery(MATCH_GRAPHQL, {
    pollInterval: 2500,
    variables: {
      id,
      homeId,
      awayId,
      epochId,
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  const victoryA = battle(
    parseInt(homeStats[0]),
    parseInt(awayStats[0]),
    parseInt(homeStats[1]),
    parseInt(awayStats[1]),
    parseInt(homeStats[2]),
    parseInt(awayStats[2]),
    data.epoch.random,
  );

  const homeGlobalId = parseInt(data.homeToken.contract.offset) + parseInt(data.homeToken.tokenID);
  const awayGlobalId = parseInt(data.awayToken.contract.offset) + parseInt(data.awayToken.tokenID);

  return (
    <div style={{ borderStyle: "solid" }}>
      Epoch: {epochId}
      Home global ID: {homeGlobalId}
      Away global ID: {awayGlobalId}
      Are paired? {((homeGlobalId + parseInt(data.epoch.random)) % parseInt(data.battler.metaSupply) === awayGlobalId) ? "True" : "false"}
      Home is even multiple? {Math.floor(homeGlobalId / (parseInt(data.epoch.random) % parseInt(data.battler.metaSupply))) % 2 === 0 ? "True" : "false"}
      {loading ? null
        : (
          <div style={{ display: "flex", flexDirection: 'column' }}>
            <div style={{ display: "flex" }}>
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
                <div>Unresolved | Predicted Winner: {victoryA === 1 ? tokenToName(data.homeToken) : tokenToName(data.awayToken)} </div>
                <Button
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    console.log("generating PROOF")
                    // This is a bit glitchy and slow
                    const proof = await calculateBattleProof(homeStats.map(s => parseInt(s)), awayStats.map(s => parseInt(s)), data.epoch.random);

                    props.tx(
                      await props.writeContracts.Battler.battle(
                        data.homeToken.contract.id,
                        data.awayToken.contract.id,
                        data.homeToken.tokenID,
                        data.awayToken.tokenID,
                        data.epoch.id,
                        victoryA,
                        proof,
                      ),
                    )
                  }}
                >
                  Resolve
                </Button>
              </div>
            }
          </div>
        )
      }
    </div >
  );
}

export default Match;
