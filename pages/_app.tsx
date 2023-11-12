import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainProvider } from "@cosmos-kit/react";
import { ChakraProvider } from "@chakra-ui/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { GasPrice } from "@cosmjs/stargate";

import { SignerOptions } from "@cosmos-kit/core";
import { chains, assets } from "chain-registry";
import { defaultTheme } from "../config";
import "@interchain-ui/react/styles";

//import { getSigningCosmosClientOptions } from "interchain";
//import { wallets } from '@cosmos-kit/keplr';

function CreateCosmosApp(args: any) {

  // { Component, pageProps }: AppProps. <- this is no longer legal since |null is not legal

  const Component : any = args.Component
  const pageProps : any = args.pageProps

  const signerOptions: SignerOptions = {
    //signingStargate: (chain: Chain) => {
    //  return getSigningCosmosClientOptions();
    //},
    signingCosmwasm: (chain: any) => {
      // return corresponding cosmwasm options or undefined
      switch (chain.chain_name) {
        case "osmosis":
          return {
            gasPrice: GasPrice.fromString("0.0025uosmo"),
          };
        case "juno":
          return {
            gasPrice: GasPrice.fromString("0.0025ujuno"),
          };
        case "junotestnet":
          return {
            gasPrice: GasPrice.fromString("0.0025ujunox"),
          };
      }
    },
  };

  return (
    <ChakraProvider theme={defaultTheme}>
      <ChainProvider
        chains={chains}
        assetLists={assets}
        wallets={[...keplrWallets, ...cosmostationWallets, ...leapWallets]}
        walletConnectOptions={{
          signClient: {
            projectId: "a8510432ebb71e6948cfd6cde54b70f7",
            relayUrl: "wss://relay.walletconnect.org",
            metadata: {
              name: "CosmosKit Template",
              description: "CosmosKit dapp template",
              url: "https://docs.cosmoskit.com/",
              icons: [],
            },
          },
        }}
        endpointOptions={{
          endpoints: {
            // Specify custom testnet endpoint with less rate limiting
            junotestnet: {
              rpc: ["https://rpc.uni.junonetwork.io:443"],
            },
          },
        }}
        signerOptions={signerOptions}
      >
        <Component {...pageProps} />
      </ChainProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
