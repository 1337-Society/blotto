"use client";

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
  const { address, getCosmWasmClient, getSigningCosmWasmClient } =
    useChain(chainName);

  let client = getCosmWasmClient().then(async (cli) => {
    let config = await cli.queryContractSmart(blottoContractAddress, {
      config: {},
    });

    let armies = await cli.queryContractSmart(blottoContractAddress, {
      armies: {},
    });

    let battlefields = await cli.queryContractSmart(blottoContractAddress, {
      battlefields: {},
    });
    console.log(armies, battlefields, config);
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

      <Battles></Battles>

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
