import { gql, useQuery } from "@apollo/client";
import React from "react";
import { TokenWidget } from "./Tokens";
import { Button } from "antd";
import { calculateBattleProof } from "../snarks.js"
import { useLocation } from "react-router-dom";
import { tokenToName } from "./MatchWidget";
import { mimcHash } from "@darkforest_eth/hashing";
import bigInt from "big-integer";
import { Link } from "react-router-dom";

const n = 50;

export const battle = (healthA, healthB, healthPerTurnA, healthPerTurnB, damageA, damageB, rand) => {
  const healthsA = new Array(n);
  const healthsB = new Array(n);
  const isHitA = new Array(n);
  const isHitB = new Array(n);
  const hashA = new Array(n);
  const hashB = new Array(n);

  // Prevent underflow
  healthsA[0] = healthA + damageB * n;
  healthsB[0] = healthB + damageA * n;

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

function Match(props) {
  const EXAMPLE_GRAPHQL = gql`
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
        offset
      }
      tokenID
      stats
      owner {
        id
      }
    }
  }
  `;

  const location = useLocation();
  const id = location.pathname.split("/")[2].replace(" ", "");
  const arr = id.split("_");
  const homeId = arr[0] + "_" + arr[2];
  const awayId = arr[1] + "_" + arr[3];
  const epochId = arr[4];

  const { loading, data } = useQuery(EXAMPLE_GRAPHQL, {
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
    parseInt(data.homeToken.stats[0]),
    parseInt(data.awayToken.stats[0]),
    parseInt(data.homeToken.stats[1]),
    parseInt(data.awayToken.stats[1]),
    parseInt(data.homeToken.stats[2]),
    parseInt(data.awayToken.stats[2]),
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
                <TokenWidget p={data.homeToken} />
              </Link>
              vs
              <Link to={`/token/${data.awayToken.id}`}>
                <TokenWidget p={data.awayToken} />
              </Link>

            </div>
            {data.match ? <div>
              Resolved | Winner: {tokenToName(data.match.winner)}
            </div>
              :
              <div>
                <div>Unresolved | Winner: {victoryA === 1 ? tokenToName(data.homeToken) : tokenToName(data.awayToken)} </div>
                <Button
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    console.log("generating PROOF")
                    // This is a bit glitchy and slow
                    const proof = await calculateBattleProof(data.homeToken, data.awayToken, data.epoch.random);

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
