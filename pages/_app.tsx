import "../styles/globals.css";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { GasPrice } from "@cosmjs/stargate";

import { SignerOptions } from "@cosmos-kit/core";
import { chains, assets } from "chain-registry";
import "@interchain-ui/react/styles";

import "../styles/globals.css";

function App(args: any) {
  const Component: any = args.Component;
  const pageProps: any = args.pageProps;

  const signerOptions: SignerOptions = {
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
    <ChainProvider
      chains={chains}
      assetLists={assets}
      wallets={[...keplrWallets, ...cosmostationWallets, ...leapWallets]}
      endpointOptions={{
        endpoints: {
          // Specify custom testnet endpoint with less rate limiting
          // junotestnet: {
          //  rpc: ["https://rpc.uni.junonetwork.io:443"],
          // },
        },
      }}
      signerOptions={signerOptions}
    >
      <Component {...pageProps} />
    </ChainProvider>
  );
}

export default App;
