
import { useState } from 'react';
import { MouseEventHandler } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

import {
  Box,
  Center,
  Grid,
  GridItem,
  Icon,
  Stack,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

import { WalletStatus } from '@cosmos-kit/core';
import { useChain, useManager } from '@cosmos-kit/react';

import {
  Error,
  Connected,
  ConnectedShowAddress,
  ConnectedUserInfo,
  Connecting,
  ConnectStatusWarn,
  CopyAddressBtn,
  Disconnected,
  NotExist,
  Rejected,
  RejectedWarn,
  WalletConnectComponent,
  ChainCard,
  HackCw20,
} from '../components';

import { chainName, cw20ContractAddress } from '../config';
import { ContractsProvider, useContracts } from '../codegen/contracts-context';

const ContractComponent = ({ children }: { children: any }) => {
  const { address, getCosmWasmClient, getSigningCosmWasmClient } = useChain(chainName);
  return (
    <ContractsProvider contractsConfig={{
      address,
      getCosmWasmClient,
      getSigningCosmWasmClient
    }}>
      {children}
    </ContractsProvider>
  );
};

const RenderBalance = () => {
  const { hackCw20 } = useContracts();
  const { address, status } = useChain(chainName);
  const [cw20Bal, setCw20Bal] = useState<string | null>(null);

  if (status === 'Connected' && hackCw20.cosmWasmClient) {
    const client = hackCw20.getQueryClient(cw20ContractAddress);
    client.balance({ address }).then((b) => setCw20Bal(b.balance));
  }

  return (
    <Box w="full" maxW="md" mx="auto">
      <HackCw20
        balance={cw20Bal}
        isConnectWallet={status !== WalletStatus.Disconnected}
      />
    </Box>
  );
}

export const WalletSection = () => {
  const {
    connect,
    openView,
    status,
    username,
    address,
    message,
    wallet,
    chain: chainInfo,
  } = useChain(chainName);
  const { getChainLogo } = useManager();

  const chain = {
    chainName,
    label: chainInfo.pretty_name,
    value: chainName,
    icon: getChainLogo(chainName),
  };

  // Events
  const onClickConnect: MouseEventHandler = async (e) => {
    e.preventDefault();
    await connect();
  };

  const onClickOpenView: MouseEventHandler = (e) => {
    e.preventDefault();
    openView();
  };

  // Components

  const userInfo = username && (
    <ConnectedUserInfo username={username} />
  );

  const addressBtn = (
    <CopyAddressBtn
      walletStatus={status}
      connected={<ConnectedShowAddress address={address} isLoading={false} />}
    />
  );

  const WalletButton = (
    <WalletConnectComponent
      walletStatus={status}
      disconnect={
        <Disconnected buttonText="Connect Wallet" onClick={onClickConnect} />
      }
      connecting={<Connecting />}
      connected={
        <Connected buttonText={'My Wallet'} onClick={onClickOpenView} />
      }
      rejected={<Rejected buttonText="Reconnect" onClick={onClickConnect} />}
      error={<Error buttonText="Change Wallet" onClick={onClickOpenView} />}
      notExist={
        <NotExist buttonText="Install Wallet" onClick={onClickOpenView} />
      }
    />
  );

  const WalletWarn = (
    <ConnectStatusWarn
      walletStatus={status}
      rejected={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${wallet?.prettyName}: ${message}`}
        />
      }
      error={
        <RejectedWarn
          icon={<Icon as={FiAlertTriangle} mt={1} />}
          wordOfWarning={`${wallet?.prettyName}: ${message}`}
        />
      }
    />
  );

  return (
      <ContractComponent>
        <Stack justifyContent="center" alignItems="center">
          {userInfo}
          {addressBtn}
         <Box w="full" maxW={{ base: 52, md: 64 }}>
            {WalletButton}
          </Box>
          {WalletWarn}
        </Stack>
      </ContractComponent>
  );
};
