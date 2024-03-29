import type { Chain } from "@chain-registry/types";
import type {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import type { ChainContext, ChainWalletBase } from "@cosmos-kit/core";
import { useChain, useManager } from "@cosmos-kit/react-lite";
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BlottoClient } from "../codegen/Blotto.client";

import { chainName, blottoContractAddress } from "../config/defaults";

export interface ClientContext {
  connect: (walletType?: string) => Promise<boolean>;
  context?: ChainContext;
  disconnect: () => void;
  signingClient?: SigningCosmWasmClient;
  cosmwasmClient: CosmWasmClient;
  blottoClient: BlottoClient;
}

export const Client = createContext<ClientContext>({
  connect: () => new Promise(() => {}),
  disconnect: () => {},
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const context = useChain(chainName);

  // Check if there are already connected wallets on page load
  useEffect(() => {
    const currentClient = localStorage.getItem(
      "cosmos-kit@2:core//current-wallet"
    );
    if (currentClient) context.connect();
  }, []);

  const connect = async () => {
    context.connect();
  };

  const disconnect = async () => {
    context.disconnect();
  };

  const getClient = async () => {};

  const getBlottoClient = async () => {
    let cli = await context.getSigningCosmWasmClient();

    return new BlottoClient(
      cli,
      context && context.address ? context.address : "invalid",
      blottoContractAddress
    );
  };

  return (
    <Client.Provider
      value={{
        context,
        connect,
        disconnect,
      }}
    >
      {children}
    </Client.Provider>
  );
}

export const useClient = (): ClientContext => useContext(Client);
