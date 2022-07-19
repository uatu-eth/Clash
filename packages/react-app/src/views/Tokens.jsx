import { gql, useQuery } from "@apollo/client";
import React from "react";
import Address from "../components/Address";
import { Link } from "react-router-dom";
import { MILADY_ADDRESS, tokenToName } from "./MatchWidget";

export function TokenWidget(props) {
  return <div style={{ border: "solid" }}>
    <img style={{ border: 'solid' }} width="200" src={props.p.contract.id === MILADY_ADDRESS.toLowerCase() ? `https://www.miladymaker.net/milady/${props.p.tokenID}.png` : `https://ikzttp.mypinata.cloud/ipfs/QmYDvPAXtiJg7s8JdRBSLWdgSphQdac8j1YuQNNxcGE1hg/${props.p.tokenID}.png`} />
    <h2>{tokenToName(props.p)}</h2>
    Owner: <Address address={props.p.owner.id} fontSize={16} />
  </div>
}

export function TokenWidgetEmpty() {
  return <div style={{ border: "solid" }}>
    <img
      style={{ border: "solid" }}
      width="200"
      src="https://upload.wikimedia.org/wikipedia/commons/4/46/Question_mark_%28black%29.svg"
    />
    <h2>?</h2>
  </div>
}


function Tokens(props) {
  const EXAMPLE_GRAPHQL = gql`
  {
    tokens(orderBy: tokenID, first: 30) {
        id
        tokenID
        stats
        contract {
          id
          name
        }
        owner {
          id
        }
    }
  }
  `;

  const { loading, data, error } = useQuery(EXAMPLE_GRAPHQL, { pollInterval: 2500 });

  return (
    <>
      <h1>All NFTs</h1>
      {
        error ? error.toString() :
          loading ? null
            : (
              <div style={{ display: "flex", flexWrap: 'wrap', justifyContent: 'center' }}>
                {data.tokens.map(p => (
                  <Link to={`/token/${p.id}`}>
                    <div style={{ margin: 4 }}>
                      <TokenWidget p={p} writeContracts={props.writeContracts} />
                    </div>
                  </Link>
                ))}
              </div>
            )
      }
    </>
  );
}

export default Tokens;
