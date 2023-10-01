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
} from "@chakra-ui/react";

import { NavBar } from "../components/navbar";
import { chainName, blottoContractAddress } from "../config/defaults";
import { Battles } from "../components/battle";
import { useChain, useWallet } from "@cosmos-kit/react";
import { useContracts } from "../codegen/contracts-context";
import { BlottoClient, BlottoQueryClient } from "../codegen/Blotto.client";
import { Army, Battlefield, Config } from "../codegen/Blotto.types";

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

      setArmies(await blotto.armies());
      setBattlefields(await blotto.battlefields());
      setConfig(await blotto.config());
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
