/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { Timestamp, Uint64, InstantiateMsg, InstantiateMsgData, ArmyInfo, BattlefieldInfo, ExecuteMsg, ExecMsg, QueryMsg, QueryMsg1, Uint128, ArrayOfArmy, Army, Battlefield, ArrayOfBattlefield, Config, GamePhase, StatusResponse } from "./Blotto.types";
export interface BlottoReadOnlyInterface {
  contractAddress: string;
  army: ({
    id
  }: {
    id: number;
  }) => Promise<Army>;
  armies: () => Promise<ArrayOfArmy>;
  battlefield: ({
    id
  }: {
    id: number;
  }) => Promise<Battlefield>;
  battlefields: () => Promise<ArrayOfBattlefield>;
  config: () => Promise<Config>;
  status: () => Promise<StatusResponse>;
}
export class BlottoQueryClient implements BlottoReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.army = this.army.bind(this);
    this.armies = this.armies.bind(this);
    this.battlefield = this.battlefield.bind(this);
    this.battlefields = this.battlefields.bind(this);
    this.config = this.config.bind(this);
    this.status = this.status.bind(this);
  }

  army = async ({
    id
  }: {
    id: number;
  }): Promise<Army> => {
    return this.client.queryContractSmart(this.contractAddress, {
      army: {
        id
      }
    });
  };
  armies = async (): Promise<ArrayOfArmy> => {
    return this.client.queryContractSmart(this.contractAddress, {
      armies: {}
    });
  };
  battlefield = async ({
    id
  }: {
    id: number;
  }): Promise<Battlefield> => {
    return this.client.queryContractSmart(this.contractAddress, {
      battlefield: {
        id
      }
    });
  };
  battlefields = async (): Promise<ArrayOfBattlefield> => {
    return this.client.queryContractSmart(this.contractAddress, {
      battlefields: {}
    });
  };
  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  status = async (): Promise<StatusResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      status: {}
    });
  };
}
export interface BlottoInterface extends BlottoReadOnlyInterface {
  contractAddress: string;
  sender: string;
  stake: ({
    armyId,
    battlefieldId
  }: {
    armyId: number;
    battlefieldId: number;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  tally: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdraw: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class BlottoClient extends BlottoQueryClient implements BlottoInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.stake = this.stake.bind(this);
    this.tally = this.tally.bind(this);
    this.withdraw = this.withdraw.bind(this);
  }

  stake = async ({
    armyId,
    battlefieldId
  }: {
    armyId: number;
    battlefieldId: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      stake: {
        army_id: armyId,
        battlefield_id: battlefieldId
      }
    }, fee, memo, _funds);
  };
  tally = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      tally: {}
    }, fee, memo, _funds);
  };
  withdraw = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {}
    }, fee, memo, _funds);
  };
}