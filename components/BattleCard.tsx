import { BlottoClient } from "../codegen/Blotto.client";
import React, { useState, useEffect, useCallback } from "react";
import { coin } from "@cosmjs/stargate";
import {
  Army,
  Battlefield,
  Config,
  PlayerInfoResponse,
  StakeInfo,
  GamePhase,
} from "../codegen/Blotto.types";
import BattleBar from "./BattleBar";
import { useContracts } from "../codegen/contracts-context";
import { blottoContractAddress } from "../config";

export default function BattleCard(args: any) {
  const battle: Battlefield = args.battle;
  const config: Config = args.config;
  let playerInfo = args.player;

  const [playerStake, setPlayerStake] = useState<StakeInfo>();

  let [blueTotal, setBlueTotal] = useState("0");
  let [redTotal, setRedTotal] = useState("0");

  const contracts = useContracts();

  useEffect(() => {
    let getData = async () => {
      const blotto = contracts.blotto.getQueryClient(blottoContractAddress);

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
  }, [playerInfo, battle, contracts]);

  // TODO UI to handle getting amount
  const stake = async (armyId: number, battlefieldId: number) => {
    const blotto = contracts.blotto.getSigningClient(blottoContractAddress);
    let res = await blotto.stake({ armyId, battlefieldId }, "auto", "", [
      coin("100", config.denom),
    ]);
    console.log(res);
    // TODO refresh data on tx
  };

  return (
    <div className="max-w-md bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <img
        src={battle.image_uri || ""}
        alt={battle.name || ""}
        className="rounded-t-lg"
      />
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {battle.name || ""}
        </h5>
        <span>Victory points: {battle.value || 0}</span>
        <span>{battle.description}</span>
        {playerStake && (
          <span>
            Your Stake: {playerStake.amount} on{" "}
            {playerStake.army === 1 ? "red" : "blue"}
          </span>
        )}

        <div className="m-5">
          <BattleBar red={redTotal} blue={blueTotal}></BattleBar>
        </div>

        <br />

        <div className="flex">
          <button
            type="button"
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            onClick={() => stake(1, battle.id)}
          >
            Stake Red Soldiers
          </button>
          &nbsp;
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={() => stake(2, battle.id)}
          >
            Stake Blue Soldiers
          </button>
        </div>
      </div>
    </div>
  );
}
