import type { Chain } from "@chain-registry/types";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { ChainWalletBase } from "@cosmos-kit/core";
import { useChain, useManager } from "@cosmos-kit/react-lite";
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { chainName, blottoContractAddress } from "../config/defaults";

export interface WalletContext {
  account: any;
  isConnecting: boolean;
  connect: (walletType?: string) => Promise<boolean>;
  disconnect: () => void;
}

export const Wallet = createContext<WalletContext>({
  account: undefined,
  isConnecting: false,
  connect: () => new Promise(() => {}),
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const context = useChain(chainName);

  // Check if there are already connected wallets on page load
  useEffect(() => {
    const currentWallet = localStorage.getItem(
      "cosmos-kit@2:core//current-wallet"
    );
    if (currentWallet) context.connect(chainName);
  }, []);

  return (
    <Wallet.Provider
      value={{
        account,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </Wallet.Provider>
  );
}

export const useWallet = (): WalletContext => useContext(Wallet);
