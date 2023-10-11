"use client";

import React, { useState, useEffect } from "react";

import Head from "next/head";

import {
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
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";

import { NavBar } from "../components/navbar";

import { useChain } from "@cosmos-kit/react";

import { chainName, blottoContractAddress } from "../config/defaults";

import { ContractsProvider } from "../codegen/contracts-context";
import { BlottoClient } from "../codegen/Blotto.client";
import {
  Army,
  Battlefield,
  Config,
  PlayerInfoResponse,
  StakeInfo,
} from "../codegen/Blotto.types";
import { coin } from "@cosmjs/stargate";

const BattleBar = (args: any) => {
  let red = args.red;
  let blue = args.blue;

  // TODO probably a better way to handle this bar
  let redWidth;
  let blueWidth;
  switch (true) {
    // TODO this is broken
    // Red is not zero but blue is, full red
    case red !== "0" && blue === "0":
      redWidth = "100%";
      blueWidth = "100%";
      break;
    // blue is not zero but red is, full blue
    case red === "0" && blue !== "0":
      redWidth = "0%";
      blueWidth = "100%";
      break;
    // TODO this is probably very wrong
    // Neither are zero, find the ratio of red to blue
    case red !== "0" && blue !== "0":
      redWidth = `${Math.floor(((red / blue) * 100) / 2)}%`;
      blueWidth = `${Math.floor(((blue / red) * 100) / 2)}%`;
      break;
    // Default to equal width
    default:
      redWidth = "50%";
      blueWidth = "100%";
  }

  return (
    <div
      className="Widget"
      style={{ background: "#6060f0", width: blueWidth, color: "white" }}
    >
      <div
        style={{
          background: "#f06060",
          width: redWidth,
          display: "inline-block",
          color: "white",
        }}
      >
        {red}
      </div>{" "}
      {blue}
    </div>
  );
};

const BattleCard = (args: any) => {
  const battle: Battlefield = args.battle;
  const blotto: BlottoClient = args.blotto;
  const config: Config = args.config;
  let playerInfo = args.player;

  const [playerStake, setPlayerStake] = useState<StakeInfo>();

  let [blueTotal, setBlueTotal] = useState("0");
  let [redTotal, setRedTotal] = useState("0");

  useEffect(() => {
    let getData = async () => {
      // Get total staked amount on battlefield for red
      setRedTotal(
        await blotto.armyTotalsByBattlefield({
          armyId: 1,
          battlefieldId: battle.id,
        })
      );

      // Get total staked amount on battlefield for blue
      setBlueTotal(
        await blotto.armyTotalsByBattlefield({
          armyId: 2,
          battlefieldId: battle.id,
        })
      );
    };
    getData();

    if (playerInfo) {
      let stakes = playerInfo.stakes;
      for (let i in stakes) {
        if (stakes[i].battlefield_id === battle.id) {
          setPlayerStake(stakes[i]);
        }
      }
    }
  }, [playerInfo, battle, blotto]);

  // TODO UI to handle getting amount
  const stake = async (armyId: number, battlefieldId: number) => {
    let res = await blotto.stake({ armyId, battlefieldId }, "auto", "", [
      coin("100", config.denom),
    ]);
    console.log(res);
    // TODO refresh data on tx
  };

  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      borderRadius={5}
      boxShadow={useColorModeValue(
        "0 2px 5px #ccc",
        "0 1px 3px #727272, 0 2px 12px -2px #2f2f2f"
      )}
      _hover={{
        color: useColorModeValue("purple.600", "purple.300"),
        boxShadow: useColorModeValue(
          "0 2px 5px #bca5e9",
          "0 0 3px rgba(150, 75, 213, 0.8), 0 3px 8px -2px rgba(175, 89, 246, 0.9)"
        ),
      }}
    >
      <Stack>
        <CardBody>
          <Heading size="md">{battle.name || ""}</Heading>
          <Text py="3">Victory points: {battle.value || 0}</Text>
          <Text py="3">{battle.description}</Text>
          {playerStake && (
            <Text py="3">
              Your Stake: {playerStake.amount} on{" "}
              {playerStake.army === 1 ? "red" : "blue"}
            </Text>
          )}
        </CardBody>

        <CardBody>
          <BattleBar red={redTotal} blue={blueTotal}></BattleBar>
        </CardBody>

        <CardFooter>
          <Button
            variant="solid"
            colorScheme="red"
            onClick={() => stake(1, battle.id)}
          >
            Stake Red Soldiers
          </Button>
          &nbsp;
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={() => stake(2, battle.id)}
          >
            Stake Blue Soldiers
          </Button>
        </CardFooter>
      </Stack>

      <Image
        objectFit="cover"
        maxW={{ base: "100%", sm: "200px" }}
        src={battle.image_uri || ""}
        alt={battle.name || ""}
      />
    </Card>
  );
};

let latch = false;

export default function Home() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [battlefields, setBattlefields] = useState<Battlefield[]>([]);
  const [config, setConfig] = useState<Config>();
  const [blotto, setBlotto] = useState<BlottoClient>();
  const [playerInfo, setPlayerInfo] = useState<PlayerInfoResponse>();

  // TODO do this properly with chakra UI themes, or switch UI framework
  // Hack to force dark mode
  const { colorMode, toggleColorMode } = useColorMode();
  if (typeof window !== "undefined") {
    if (colorMode === "light") {
      toggleColorMode();
    }
  }

  // Get someting called a context which appears to be something around a current user and a chain
  const context = useChain(chainName);

  useEffect(() => {
    if (latch) return;
    let getData = async () => {
      let cli: any = null;

      cli =
        context.status != "Connected"
          ? await context.getCosmWasmClient()
          : await context.getSigningCosmWasmClient();

      console.log(
        "address:",
        context.address,
        "username:",
        context.username,
        "connected:",
        context.status
      );

      // rather than issuing a useEffect({fn,[]}) once I'd like to have the child components have a connected wallet ...
      // this is kind of clumsy @todo improve
      latch = context.address ? true : false;

      let blotto = new BlottoClient(
        cli,
        context && context.address ? context.address : "invalid",
        blottoContractAddress
      );
      setBlotto(blotto);
      setConfig(await blotto.config());
      setArmies(await blotto.armies());
      setBattlefields(await blotto.battlefields());
      if (context.address)
        setPlayerInfo(await blotto.playerInfo({ player: context.address }));
    };
    getData();
  }, [context]);

  // TODO show countdown with how much time is left

  // TODO show staked totals for each army (armies query already has the total)

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
            address: context.address,
            getCosmWasmClient: context.getCosmWasmClient,
            getSigningCosmWasmClient: context.getSigningCosmWasmClient,
          }}
        >
          <VStack>
            {battlefields.map((entry, key) => (
              <BattleCard
                key={key}
                battle={entry}
                blotto={blotto}
                config={config}
                player={playerInfo}
              ></BattleCard>
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
