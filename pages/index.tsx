"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useChain } from "@cosmos-kit/react";
import { chainName, blottoContractAddress } from "../config/defaults";
import { ContractsProvider } from "../codegen/contracts-context";
import { BlottoQueryClient } from "../codegen/Blotto.client";
import {
  Army,
  Battlefield,
  Config,
  PlayerInfoResponse,
} from "../codegen/Blotto.types";
import BattleCard from "../components/BattleCard";
import NavBar from "../components/NavBar";

export default function Home() {
  const [armies, setArmies] = useState<Army[]>([]);
  const [battlefields, setBattlefields] = useState<Battlefield[]>([]);
  const [config, setConfig] = useState<Config>();
  const [blotto, setBlotto] = useState<BlottoQueryClient>();
  const [playerInfo, setPlayerInfo] = useState<PlayerInfoResponse>();
  const [gamePhase, setGamePhase] = useState<string | undefined>(undefined);
  const [tally, setTally] = useState<any>({
    winner_name: "nobody",
    winner_id: "0",
    prize_pool: "0",
  });
  const [winner, setWinner] = useState<Army>();

  const context = useChain(chainName);

  useEffect(() => {
    let getData = async () => {
      const cli = await context.getCosmWasmClient();

      console.log(
        "address:",
        context.address,
        "username:",
        context.username,
        "connected:",
        context.status
      );

      let blotto = new BlottoQueryClient(cli, blottoContractAddress);
      setBlotto(blotto);
      setConfig(await blotto.config());
      setArmies(await blotto.armies());
      setBattlefields(await blotto.battlefields());
      const results = await blotto.status();
      setGamePhase(results.game_phase);
      if (gamePhase == "closed") {
        setWinner(results.winner);
      }
      if (context.address) {
        setPlayerInfo(await blotto.playerInfo({ player: context.address }));
      }
    };
    getData();
  }, []);

  const handleTally = async () => {
    try {
      setTally(await blotto.tally());
    } catch (e) {
      console.error("Cannot tally ", e);
    }
  };

  const handleWithdraw = async () => {
    await blotto?.withdraw();
  };

  console.log("config", config);
  console.log("playerInfo", playerInfo);
  console.log("battlefields", battlefields);
  console.log("armies", armies);

  // TODO Show Current Game Phase in a more pretty way

  // TODO show countdown with how much time is left

  // TODO show staked totals for each army (armies query already has the total)

  // TODO show more player info

  // uh... why divide by 100000 ? @todo
  let end: any = new Date();
  if (config && config.start)
    end.setTime(
      (parseInt(config.start) + parseInt(config.battle_duration)) / 1000000
    );
  end = end.toLocaleDateString("en-US");

  let now = new Date();

  if (gamePhase == "closed" || gamePhase == "not_started") {
    return (
      <ContractsProvider
        contractsConfig={{
          address: context.address,
          getCosmWasmClient: context.getCosmWasmClient,
          getSigningCosmWasmClient: context.getSigningCosmWasmClient,
        }}
      >
        <Head>
          <title>Blotto : {gamePhase}</title>
          <meta name="description" content="Blotto on chain" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <br />

        <div>
          <div>
            <h2>
              GAME PHASE IS CLOSED
              <br />
              WINNER IS {winner.name + ""}
              <br />
              PRIZE {tally.prize_pool + ""}
            </h2>
            <button
              type="button"
              className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              onClick={handleWithdraw}
            >
              Withdraw
            </button>
          </div>
        </div>
      </ContractsProvider>
    );
  }

  return (
    <ContractsProvider
      contractsConfig={{
        address: context.address,
        getCosmWasmClient: context.getCosmWasmClient,
        getSigningCosmWasmClient: context.getSigningCosmWasmClient,
      }}
    >
      <Head>
        {gamePhase ? (
          <title>Blotto : {gamePhase}</title>
        ) : (
          <title>Blotto</title>
        )}

        <meta name="description" content="Blotto on chain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar context={context} />

      <br />

      {end > now && (
        <button
          type="button"
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          onClick={handleTally}
        >
          Tally
        </button>
      )}

      <div className="container mx-auto">
        {/* <div>GAME PHASE IS OPEN TILL {end}</div> */}
        <div className="grid grid-cols-3 gap-3">
          {battlefields.map((entry, key) => (
            <BattleCard
              key={key}
              battle={entry}
              config={config}
              player={playerInfo}
            ></BattleCard>
          ))}
        </div>
      </div>
    </ContractsProvider>
  );
}
