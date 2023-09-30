"use client";

import React, { useState, useEffect } from 'react';

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
} from "@chakra-ui/react";

import { NavBar } from "../components/navbar";
import { chainName, blottoContractAddress } from "../config/defaults";
import { Battles } from "../components/battle";
import { useChain } from "@cosmos-kit/react";

// testing the cosmwasm demo
// import { Home } from '../components/test'
// export default Home

export default function Home() {

  const [battlefields, setBattlefields] = useState([]);

  const { address, getCosmWasmClient, getSigningCosmWasmClient } = useChain(chainName);

  useEffect(() => {

    if(battlefields.length) return // @todo error: this is being called more than once???

    let client = getCosmWasmClient().then(async (cli) => {
      let config = await cli.queryContractSmart(blottoContractAddress, {
        config: {},
      });

      let armies = await cli.queryContractSmart(blottoContractAddress, {
        armies: {},
      });

      let battlefields2 = await cli.queryContractSmart(blottoContractAddress, {
        battlefields: {},
      });
      setBattlefields(battlefields2)
    });
  })

  return (
    <Container maxW="3xl" py={10}>
      <Head>
        <title>Blotto</title>
        <meta name="description" content="Blotto on chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar></NavBar>
      <br />

      <Battles battlefields={battlefields}></Battles>

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
