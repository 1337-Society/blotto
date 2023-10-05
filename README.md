# BLOTTO

## Getting Started

First, install the packages and run the development server:

```bash
yarn && yarn dev
```

## Understanding how codegen, cosmwasm and cca (create-cosmos-app) all work together

There's a stack of pieces that all work together, they rely on react and react chakra ui:

```
@cosmwasm/ts-codegen for generated CosmWasm contract Typescript classes
@cosmology/telescope a "babel for the Cosmos", Telescope is a TypeScript Transpiler for Cosmos Protobufs.
chain-registry an npm module for the official Cosmos chain-registry.
cosmos-kit A wallet connector for the Cosmos ⚛️
create-cosmos-app set up a modern Cosmos app by running one command.
starship a k8s-based unified development environment for Cosmos Ecosystem
```

### Cosmos Kit

This gives us access to the actual user wallet, address and facts in a reactive way:

https://docs.cosmoskit.com/get-started

See also:

https://github.com/cosmology-tech/cosmos-kit/blob/main/packages/example/pages/tx.tsx

```
import * as React from 'react';
 
import { useChain } from "@cosmos-kit/react";
 
function Component ({ chainName }: { chainName: string }) => {
    const chainContext = useChain(chainName);
 
    const {
      status,
      username,
      address,
      message,
      connect,
      disconnect,
      openView,
    } = chainContext;
}
```

### CodeGen

Their intro says "The quickest and easiest way to interact with CosmWasm Contracts. @cosmwasm/ts-codegen converts your CosmWasm smart contracts into dev-friendly TypeScript classes so you can focus on shipping code.". See:

	https://github.com/CosmWasm/ts-codegen

More specifically codegen performs two distinct things:

	1) it exposes rust/wasm contracts to typescript (as advertised)

	2) it exposes rust/wasm contract integration to react itself with a specific recommended usage/setup pattern

In their example they introduce a concept of a ContractsProvider. Apparently it wants an address - which may be the ledger address of the contract?:

```
import { useChain } from '@cosmos-kit/react';
import { ContractsProvider } from '../path/to/codegen/contracts-context';

export default function YourComponent() {

  const {
    address,
    getCosmWasmClient,
    getSigningCosmWasmClient
  } = useChain(chainName);

  return (
    <ContractsProvider
      contractsConfig={{
        address,
        getCosmWasmClient,
        getSigningCosmWasmClient,
      }}
    >
        <SomeCoolComponent />
    </ContractsProvider>
  )
};
```

From there, there's some kind of concept or assumption that a developer wants or needs to then useContracts(). Perhaps this is some kind of late binding effect? It doesn't seem like a sender is specified here? Is the sender the address of the human with the kepler wallet? It's unclear if this brings up kepler or not?

```
const { marketplace } = useContracts();
const marketplaceClient = marketplace.signingClient(marketplaceContract);
await marketplaceClient.updateAskPrice({
  collection: token.collectionAddr,
  price: {
    amount,
    denom,
  },
  tokenId,
});
```

### Create Cosmos App

https://github.com/cosmology-tech/create-cosmos-app

The meat here is to be able to have a wallet come up, and actually call the contract with signing permissions.

Here's an example of doing this at a low level - but maybe the <ContractsProvider> and the codegen stuff magically hides some of this work? It isn't totally clear to me if a developer should do this explicitly or if it is magiked away:

https://github.com/cosmology-tech/create-cosmos-app/blob/main/examples/nft/components/sell-nfts/SellNftsSection.tsx

```
const { isWalletConnected } = useChain(chainName);
const { contracts, isReady } = useContracts();

const handleClick = async () => {
	if (!address || !isReady) return;

	const client = contracts.sg721Updatable.getSigningClient(token.collectionAddr);

	const marketplaceMsgComposer =
	  contracts.marketplace.getMessageComposer(marketplaceContract);

	const sg721UpdatableMsgComposer =
	  contracts.sg721Updatable.getMessageComposer(token.collectionAddr);

	const msgs = [
	  sg721UpdatableMsgComposer.approve({
	    spender: marketplaceContract,
	    tokenId: token.tokenId,
	    expires: { at_time: getExpirationTime('14') },
	  }),
	  marketplaceMsgComposer.acceptCollectionBid({
	    collection: token.collectionAddr,
	    tokenId: parseInt(token.tokenId),
	    bidder: token.highestCollectionBidEvent!.bidder!.addr,
	  }),
	];

	await tx(msgs, { gas: '666666' }, () => {
		// done
	});

};
```

## GOTCHAS


### must set a gas price?

	getSigningCosmWasmClientOptions

	https://github.com/cosmology-tech/chain-registry/issues/13

	https://docs.cosmoskit.com/provider/chain-provider#adding-localnet-and-testnets

### Must pick a wallet?

https://docs.walletconnect.com/advanced/providers/universal

## UX

	? chakra ui overrides colorMode and doesn't seem to listen to theme.js settings

	- improve progress bar

	- nav bar should be stickier to the top; not show below

	- the wallet menu is a bit bulky visually

	- tug of war art

	- stats on each item

## contract

	- show juno balance
  - show where you actually staked stuff
  - reflect the contract state (play, or outcome)
  - show the actual live number of soldiers per battle
  - withdraw button for outcome page

## layout


main page prior to game

	[blotto!]  [about]

		BLOTTO IS STARTING IN X DAYS : MIN : SEC


main page during game

	[blotto!]  [about]

		BLOTTO IS LIVE!

		[battlefield x]
		[xxxxxxxxx    ]
		[RED]    [BLUE]

		[battlefield x]
		[xxxxxxxxx    ]

		[battlefield x]
		[xxxxxxxxx    ]

		[battlefield x]
		[xxxxxxxxx    ]

		[battlefield x]
		[xxxxxxxxx    ]

main page during reconciliation

	[blotto!]  [about]

		BLUE VICTORY!

		[withdraw]

****************
