"use client";

import React, { useState, useEffect } from "react";

import Head from "next/head";

import { LinkIcon } from "@chakra-ui/icons";

import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  VStack,
  Center,
  Card,
  CardBody,
  CardFooter,
  Container,
  Image,
  Link,
  Button,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

import { NavBar } from "../components/navbar";

import { useChain, useWallet } from "@cosmos-kit/react";

import { chainName, blottoContractAddress } from "../config/defaults";

import { ContractsProvider } from '../codegen/contracts-context';
import { useContracts } from "../codegen/contracts-context";
import { BlottoClient } from "../codegen/Blotto.client";
import { Army, Battlefield, Config } from "../codegen/Blotto.types";

const BattleBar = () => {
  return (
    <div className="Widget" style={{background:"#6060f0",width:"100%",color:"white"}}>
      <div style={{background:"#f06060",width:"19%",display:"inline-block",color:"white"}}>
        23
      </div> 77
    </div>
  );
}

const BattleCard = (args:any) => {

  const battle: Battlefield = args.battle
  const blotto: BlottoClient = args.blotto

  // hack - use built in art if none supplied
  if(!battle.ipfs_uri || !battle.ipfs_uri.length) {
    battle.ipfs_uri = `/images/${battle.name}.png`
  }

  const stakeRed = ()=>{
    // test - @todo must set from config
    const army_id: any = 1;
    const battlefield_id: any = 1;
    blotto.stake(army_id,battlefield_id)
  }

  const stakeBlue = ()=>{
    // test - @todo must set from config
    const army_id: any = 1;
    const battlefield_id: any = 1;
    blotto.stake(army_id,battlefield_id)
  }

  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      borderRadius={5}
      boxShadow={useColorModeValue(
        '0 2px 5px #ccc',
        '0 1px 3px #727272, 0 2px 12px -2px #2f2f2f'
      )}
      _hover={{
        color: useColorModeValue('purple.600', 'purple.300'),
        boxShadow: useColorModeValue(
          '0 2px 5px #bca5e9',
          '0 0 3px rgba(150, 75, 213, 0.8), 0 3px 8px -2px rgba(175, 89, 246, 0.9)'
        )
      }}
    >

      <Stack>

        <CardBody>
          <Heading size='md'>{battle.name || ""}</Heading>
          <Text py='3'>Victory points: {battle.value || 0}</Text>
        </CardBody>

        <CardBody>

          <BattleBar></BattleBar>

        </CardBody>

        <CardFooter>
          <Button variant='solid' colorScheme='red' onClick={stakeRed}>Stake Red Soldiers</Button>
          &nbsp;
          <Button variant='solid' colorScheme='blue' onClick={stakeBlue}>Stake Blue Soldiers</Button>
        </CardFooter>
      </Stack>

      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={battle.ipfs_uri || ""}
        alt={battle.name || ""}
      />

    </Card>
  );
};

let latch = false

export default function Home() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [battlefields, setBattlefields] = useState<Battlefield[]>([]);
  const [config, setConfig] = useState<Config>();
  const [blotto, setBlotto] = useState<BlottoClient>();

  // not sure this is useful?
  // const { wallet } = useWallet()

  // get someting called a context which appears to be something around a current user and a chain
  const context = useChain(chainName);

  useEffect(() => {
    if(latch) return
    let getData = async () => {

      let cli : any = null

      cli = context.status != "Connected" ? await context.getCosmWasmClient() : await context.getSigningCosmWasmClient();

      console.log("address:",context.address,"username:",context.username,"connected:",context.status)

      // rather than issuing a useEffect({fn,[]}) once I'd like to have the child components have a connected wallet ...
      // this is kind of clumsy @todo improve
      latch = context.address ? true : false

      let blotto = new BlottoClient(cli, context && context.address ? context.address : "invalid", blottoContractAddress );
      setBlotto(blotto);
      setConfig(await blotto.config());
      setArmies(await blotto.armies());
      setBattlefields(await blotto.battlefields());
    };
    getData();
  });

  return (
    <Container maxW="3xl" py={10}>

      <Head>
        <title>Blotto</title>
        <meta name="description" content="Blotto on chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar></NavBar>
      <br />

      <Center>
        <ContractsProvider
          contractsConfig={{
            address:context.address,
            getCosmWasmClient:context.getCosmWasmClient,
            getSigningCosmWasmClient:context.getSigningCosmWasmClient,
          }}
        >
          <VStack>
              {battlefields.map((entry) => (
                  <BattleCard key={entry.name} battle={entry} blotto={blotto}></BattleCard>
              ))}
          </VStack>
        </ContractsProvider>
      </Center>

      <Stack
        isInline={true}
        spacing={1}
        justifyContent="center"
        opacity={0.5}
        fontSize="sm"
      >
        <Text>Built with</Text>
        <Link
          href="https://cosmology.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cosmology
        </Link>
      </Stack>
    </Container>
  );
}
