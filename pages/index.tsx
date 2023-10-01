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

import { useChain, useWallet } from "@cosmos-kit/react";

import { NavBar } from "../components/navbar";

import { chainName, blottoContractAddress } from "../config/defaults";
import { useContracts } from "../codegen/contracts-context";
import { BlottoClient, BlottoQueryClient } from "../codegen/Blotto.client";
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

const BattleCard = (args) => {

  const battle: Battlefield = args.battle
  console.log(battle)

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
          <Text py='2'>{battle.text || ""}</Text>
        </CardBody>

        <CardBody>

          <BattleBar></BattleBar>

        </CardBody>

        <CardFooter>
          <Button variant='solid' colorScheme='red'>Stake Red Soldiers</Button>
          &nbsp;
          <Button variant='solid' colorScheme='blue'>Stake Blue Soldiers</Button>
        </CardFooter>
      </Stack>

      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={battle.ipfs_uri}
        alt={battle.name}
      />

    </Card>
  );
};

const useMountEffect = (fun) => useEffect(fun, [])


export default function Home() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [battlefields, setBattlefields] = useState<Battlefield[]>([]);
  const [config, setConfig] = useState<Config>();

  const { getCosmWasmClient } = useChain(chainName);

  useMountEffect(() => {

    let getData = async () => {
      // Get a query client
      let cli = await getCosmWasmClient();

      // Construct a query client with nice type completions
      let blotto = new BlottoQueryClient(cli, blottoContractAddress);

      setConfig(await blotto.config());
      setArmies(await blotto.armies());

      // hack - inject some art for now while waiting for pinning services to finish
      const battlefields = await blotto.battlefields();
      battlefields.forEach((battle,index)=>{
        if(battle.ipfs_uri && battle.ipfs_uri.length) return
        battle.ipfs_uri = `/images/${battle.name}.png`
      })
      setBattlefields(battlefields);
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
        <VStack>
            {battlefields.map((entry) => (
                <BattleCard key={entry.name} battle={entry}></BattleCard>
            ))}
        </VStack>
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
