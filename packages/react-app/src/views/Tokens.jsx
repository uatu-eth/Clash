import { gql, useQuery } from "@apollo/client";
import React from "react";
import Address from "../components/Address";
import { Link } from "react-router-dom";
import { COMETH_ADDRESS, tokenToName } from "./MatchWidget";
import { useState } from "react";
import { useEffect } from "react";

export function TokenWidget(props) {
  const [image, setImage] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (props.writeContracts.EtherOrcsPoly) {
        const dataURI = await props.writeContracts.EtherOrcsPoly.tokenURI(props.p.tokenID);

        const json = atob(dataURI.substring(29));
        const result = JSON.parse(json);

        if (props.p.contract.id === COMETH_ADDRESS.toLowerCase()) {
          setImage(`https://images.service.cometh.io/${props.p.tokenID}.png`);
        } else {
          setImage(result.image)
        }
      }
    }
    fetchData();
  }, [props.p.contract.id, props.p.tokenID, props.writeContracts.EtherOrcsPoly])


  return <div style={{ border: "solid" }}>
    <img
      style={{ border: "solid" }}
      width="200"
      src={
        props.p.contract.id === COMETH_ADDRESS.toLowerCase()
          ? `https://images.service.cometh.io/${props.p.tokenID}.png`
          : image
      }
    />
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
