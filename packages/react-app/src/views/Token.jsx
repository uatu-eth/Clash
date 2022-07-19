import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useLocation } from "react-router-dom";
import { TokenWidget, TokenWidgetEmpty } from "./Tokens";
import MatchWidget from "./MatchWidget";
import { tokenToName } from "./MatchWidget";
import { matchDate } from "./MatchWidget";
import { Button } from "antd";

function Token(props) {
  const EXAMPLE_GRAPHQL = gql`
  query getToken($id: ID!){
    token(id: $id) {
        id
        tokenURI
        stats
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
    epoches {
      id
      random
      matches {
        id
      }
    }
    battler(id: 0) {
      id
      matchInterval
      reward
      startTimestamp
      metaSupply
    }
  }
  `;

  const location = useLocation();
  const { loading, data } = useQuery(EXAMPLE_GRAPHQL, { pollInterval: 2500, variables: { id: location.pathname.split("/")[2] } });

  return (
    <>
      {loading ? null
        : (
          <div>
            <h1>{tokenToName(data.token)}</h1>
            <div style={{ border: "solid", display: "flex", flexDirection: 'column' }}>
              <h2>Overview</h2>
              <div style={{ display: "flex" }}>
                <TokenWidget p={data.token} writeContracts={props.writeContracts} />
                <h3>Stats</h3>
                <ul>
                  <li>Health: {data.token.stats[0]}</li>
                  <li>Health per turn: {data.token.stats[1]}</li>
                  <li>Damage: {data.token.stats[2]}</li>
                </ul>
              </div>
            </div>

            <h2>Matches</h2>
            {[0, 1, 2, 3, 4, 5].map(i =>
              data.epoches.find(e => e.id === i.toString()) ?
                <div>
                  <MatchWidget
                    battler={data.battler}
                    epoch={data.epoches.find(e => e.id === i.toString())}
                    p={data.token}
                    tx={props.tx}
                    writeContracts={props.writeContracts}
                  />
                </div>
                :
                <div style={{ borderStyle: "solid" }}>
                  <h2>{matchDate(i, data.battler).toUTCString()}</h2>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <TokenWidgetEmpty />
                    vs
                    <TokenWidgetEmpty />
                  </div>
                  {Date.now() >= matchDate(i, data.battler) ?
                    <Button
                      style={{ marginTop: 8 }}
                      onClick={async () => {
                        props.tx(await props.writeContracts.Battler.simulateEpoch(i, Math.floor(Math.random() * 100000)))
                      }}
                    >
                      Simulate
                    </Button> : null}
                </div>
            )}
          </div>
        )
      }
    </>
  );
}

export default Token;
