use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, BankMsg, Coin, Order, Response, StdResult, Timestamp, Uint128};
use cw_storage_plus::{IndexedMap, Item, Map, MultiIndex};
use cw_utils::must_pay;
use sylvia::contract;
use sylvia::types::{ExecCtx, InstantiateCtx, QueryCtx};

use crate::responses::{PlayerInfoResponse, StatusResponse};
use crate::state::{
    army_idx, battlefield_id_idx, player_idx, Army, ArmyInfo, Battlefield, BattlefieldInfo, Config,
    GamePhase, StakeIndexes, StakeInfo,
};
use crate::ContractError;

// Version info for migration
pub const CONTRACT_NAME: &str = env!("CARGO_PKG_NAME");
pub const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

/// The maximum number of armies
pub const ARMY_LIMIT: u32 = 5;
/// The maximum number of battlefields
pub const BATTLEFIELD_LIMIT: u32 = 10;
/// Default limit for query pagination
pub const DEFAULT_LIMIT: u32 = 10;
/// Maximum limit for query pagination
pub const MAX_LIMIT: u32 = 50;

/// The instantiation message data for this contract, used to set initial state
#[cw_serde]
pub struct InstantiateMsgData {
    /// The list of armies
    pub armies: Vec<ArmyInfo>,
    /// A list of battlefields
    pub battlefields: Vec<BattlefieldInfo>,
    /// The duration of the game
    pub battle_duration: Timestamp,
    /// The denom used for staking in this contract
    pub denom: String,
}

/// The struct representing this contract, holding all contract state.
pub struct BlottoContract<'a> {
    /// Map of armies by ID
    pub armies: Map<'a, u8, Army>,
    /// The staked totals for armies by battlefield (army_id, battlefield_id)
    pub army_totals_by_battlefield: Map<'a, (u8, u8), Uint128>,
    /// A map of the different battlefields
    pub battlefields: Map<'a, u8, Battlefield>,
    /// The game config
    pub config: Item<'a, Config>,
    /// The current game phase
    pub phase: Item<'a, GamePhase>,
    /// The prize pool for winning the war
    pub prize_pool: Item<'a, Uint128>,
    /// A map of total staked amounts for players by army
    pub player_totals_by_army: Map<'a, (&'a Addr, u8), Uint128>,
    /// And indexed map of all the different stakes (army_id, battlefield_id, player)
    pub stakes: IndexedMap<'a, (u8, u8, &'a Addr), StakeInfo, StakeIndexes<'a>>,
    /// The winning army, set on game end
    pub winner: Item<'a, Army>,
}

/// The actual contract implementation, base cw721 logic is implemented in base.rs
#[cfg_attr(not(feature = "library"), sylvia::entry_points)]
#[contract]
#[error(ContractError)]
impl BlottoContract<'_> {
    pub fn new() -> Self {
        let indexes = StakeIndexes {
            army: MultiIndex::new(army_idx, "stakes", "army"),
            battlefield_id: MultiIndex::new(battlefield_id_idx, "stakes", "battlefield_id"),
            player: MultiIndex::new(player_idx, "stakes", "player"),
        };
        Self {
            armies: Map::new("armies"),
            army_totals_by_battlefield: Map::new("army_totals_by_battlefield"),
            battlefields: Map::new("battlefields"),
            config: Item::new("config"),
            phase: Item::new("phase"),
            prize_pool: Item::new("prize_pool"),
            player_totals_by_army: Map::new("player_totals_by_army"),
            stakes: IndexedMap::new("stakes", indexes),
            winner: Item::new("winner"),
        }
    }

    #[msg(instantiate)]
    pub fn instantiate(
        &self,
        ctx: InstantiateCtx,
        data: InstantiateMsgData,
    ) -> Result<Response, ContractError> {
        cw2::set_contract_version(ctx.deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

        // // TODO Validate denom
        // Needs cw-multi-test support in v0.17.0, current sylvia version ships with v0.16.5
        // let supply: Coin = ctx.deps.querier.query_supply(data.denom.clone())?;
        // if supply.amount.is_zero() {
        //     return Err(ContractError::InvalidDenom { denom: data.denom });
        // }

        // Check that there are at least two armies, and not more than the max limit
        if (data.armies.len() as u32) < 2 || (data.armies.len() as u32) > ARMY_LIMIT {
            return Err(ContractError::InvalidArmyCount {
                max_limit: ARMY_LIMIT,
            });
        }

        // Check there is at least one battlefield and not more than the max limit
        if (data.battlefields.len() as u32) == 0
            || (data.battlefields.len() as u32) > BATTLEFIELD_LIMIT
        {
            return Err(ContractError::InvalidBattlefieldCount {
                max_limit: BATTLEFIELD_LIMIT,
            });
        }

        // Initialize armies and set their totals to zero
        let mut i = 0;
        for army in data.armies {
            i += 1;
            let ArmyInfo { name, ipfs_uri } = army;
            self.armies.save(
                ctx.deps.storage,
                i,
                &Army {
                    name,
                    ipfs_uri,
                    id: i,
                    total_staked: Uint128::zero(),
                    victory_points: 0,
                },
            )?;
        }

        // Initialize battlefields
        let mut i = 0;
        for bf in data.battlefields {
            i += 1;
            self.battlefields.save(
                ctx.deps.storage,
                i,
                &Battlefield {
                    name: bf.clone().name,
                    ipfs_uri: bf.clone().ipfs_uri,
                    id: i,
                    value: bf.value,
                    winner: None,
                },
            )?;
        }

        // TODO support setting an optional start time
        // Set gamephase to open
        self.phase.save(ctx.deps.storage, &GamePhase::Open)?;

        // Save config
        self.config.save(
            ctx.deps.storage,
            &Config {
                // TODO make start time an options
                start: ctx.env.block.time,
                battle_duration: data.battle_duration,
                denom: data.denom,
            },
        )?;

        Ok(Response::new())
    }

    /// Stake troops on a particular battlefield.
    /// Only callable while the game is open.
    #[msg(exec)]
    pub fn stake(
        &self,
        ctx: ExecCtx,
        army_id: u8,
        battlefield_id: u8,
    ) -> Result<Response, ContractError> {
        // Load Config
        let config = self.config.load(ctx.deps.storage)?;

        // Check game phase is open
        if self.phase.load(ctx.deps.storage)? != GamePhase::Open {
            return Err(ContractError::NotOpen {});
        }

        // Validate proper denom was sent and get amount
        let amount = must_pay(&ctx.info, &config.denom)?;

        // Check if army exists and update total
        self.armies.update(
            ctx.deps.storage,
            army_id,
            |a| -> Result<Army, ContractError> {
                match a {
                    Some(a) => Ok(Army {
                        total_staked: a.total_staked.checked_add(amount)?,
                        ..a
                    }),
                    None => Err(ContractError::NoArmy { id: army_id }),
                }
            },
        )?;

        // Update army balance for battlefield
        self.army_totals_by_battlefield.update(
            ctx.deps.storage,
            (battlefield_id, army_id),
            |total| -> Result<Uint128, ContractError> {
                match total {
                    Some(t) => Ok(t.checked_add(amount)?),
                    None => Ok(amount),
                }
            },
        )?;

        // Save player stake info, but first check if there is an existing stake
        let existing_stake = self.stakes.may_load(
            ctx.deps.storage,
            (army_id, battlefield_id, &ctx.info.sender),
        )?;
        match existing_stake {
            Some(stake) => {
                // Can only stake on one side in a battlefield
                if stake.army != army_id {
                    return Err(ContractError::Traitor {});
                }

                self.stakes.save(
                    ctx.deps.storage,
                    (army_id.clone(), battlefield_id, &ctx.info.sender.clone()),
                    &StakeInfo {
                        amount: stake.amount.checked_add(amount)?,
                        army: army_id.clone(),
                        battlefield_id,
                        player: ctx.info.sender.clone(),
                    },
                )?
            }
            None => self.stakes.save(
                ctx.deps.storage,
                (army_id.clone(), battlefield_id, &ctx.info.sender.clone()),
                &StakeInfo {
                    amount,
                    army: army_id.clone(),
                    battlefield_id,
                    player: ctx.info.sender.clone(),
                },
            )?,
        }

        // Increment the player total for the army
        self.player_totals_by_army.update(
            ctx.deps.storage,
            (&ctx.info.sender, army_id),
            |total| -> Result<Uint128, ContractError> {
                match total {
                    Some(t) => Ok(t.checked_add(amount)?),
                    None => Ok(amount),
                }
            },
        )?;

        Ok(Response::new()
            .add_attribute("action", "stake")
            .add_attribute("army_id", army_id.to_string())
            .add_attribute("battlefield_id", battlefield_id.to_string()))
    }

    /// Tally the scores and finalize the winner.
    /// Only callable after the battle has ended.
    #[msg(exec)]
    pub fn tally(&self, ctx: ExecCtx) -> Result<Response, ContractError> {
        // Load Config
        let config = self.config.load(ctx.deps.storage)?;

        // Check game is over
        if config.start.seconds() + config.battle_duration.seconds() > ctx.env.block.time.seconds()
        {
            return Err(ContractError::NotOver {});
        }

        // Update the game phase
        self.phase.save(ctx.deps.storage, &GamePhase::Closed)?;

        // Initialize prize pool
        let mut prize_pool = Uint128::zero();

        // Loop through battlefields to determine winners
        let battlefields: Vec<(u8, Battlefield)> = self
            .battlefields
            .range(ctx.deps.storage, None, None, Order::Descending)
            .flatten()
            .collect();
        for bf in battlefields {
            let battlefield_id = bf.1.id;

            // Get all army stakes for battlefield
            let mut army_totals: Vec<(u8, Uint128)> = self
                .army_totals_by_battlefield
                .prefix(battlefield_id)
                .range(ctx.deps.storage, None, None, Order::Descending)
                .flatten()
                .collect();

            // TODO reverse sort?
            // TODO no unwrap
            // Sort army total stakes
            army_totals.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap());

            // TODO check for tie

            // TODO no unwrap
            // Determine which army won
            let (winner, dead) = army_totals.split_last().unwrap();

            println!("totals {:?}", army_totals);
            println!("winning army: {:?}", winner);

            // Remove winning army from totals, the sum the rest and add it to the prize pool
            let dead_stake: Uint128 = dead.iter().map(|a| a.1).sum();
            prize_pool = prize_pool.checked_add(dead_stake)?;

            println!("DEAD: {:?}", dead_stake);

            // Add up victory points for that army
            self.armies.update(
                ctx.deps.storage,
                winner.0,
                |a| -> Result<Army, ContractError> {
                    match a {
                        Some(a) => Ok(Army {
                            // TODO no unwrap
                            victory_points: a.victory_points.checked_add(bf.1.value).unwrap(),
                            ..a
                        }),
                        None => Err(ContractError::NoArmy { id: winner.0 }),
                    }
                },
            )?;

            // Save battlefield with the winner
            self.battlefields.save(
                ctx.deps.storage,
                battlefield_id,
                &Battlefield {
                    winner: Some(winner.0),
                    ..bf.1
                },
            )?;
        }

        // TODO refactor no unwrap
        // TODO handle tie
        // Determine over all winner
        let game_winner = self
            .armies
            .range(ctx.deps.storage, None, None, Order::Descending)
            .max_by(|a, b| {
                a.as_ref()
                    .unwrap()
                    .1
                    .victory_points
                    .cmp(&b.as_ref().unwrap().1.victory_points)
            })
            .unwrap()
            .unwrap()
            .1;
        self.winner.save(ctx.deps.storage, &game_winner)?;

        // Save the prize pool amount for the winning army
        self.prize_pool.save(ctx.deps.storage, &prize_pool)?;

        Ok(Response::new()
            .add_attribute("action", "tally")
            .add_attribute("winner_name", game_winner.name)
            .add_attribute("winner_id", game_winner.id.to_string())
            .add_attribute("prize_pool", prize_pool.to_string()))
    }

    /// Only callable after the battle has ended.
    #[msg(exec)]
    pub fn withdraw(&self, ctx: ExecCtx) -> Result<Response, ContractError> {
        // Load Config
        let config = self.config.load(ctx.deps.storage)?;

        // Check game is over
        if self.phase.load(ctx.deps.storage)? != GamePhase::Closed {
            return Err(ContractError::NotOver {});
        }

        let mut withdraw_amount = Uint128::zero();

        // Load player stakes
        let stakes = self
            .stakes
            .idx
            .player
            .prefix(ctx.info.sender.clone())
            .range(ctx.deps.storage, None, None, Order::Ascending)
            .collect::<StdResult<Vec<_>>>()?;

        // If player has no stakes, there is nothing to claim
        if stakes.is_empty() {
            return Err(ContractError::NothingToClaim {});
        }

        println!("STAKES: {:?}", stakes);
        for stake in stakes {
            let bf = self
                .battlefields
                .load(ctx.deps.storage, stake.1.battlefield_id)?;
            match bf.winner {
                Some(winner) => {
                    println!("bf winner: {:?}", winner);
                    println!("player_stake: {:?}", stake);

                    // Check if staked with the winning army, if so they can withdraw the staked balance
                    if winner == stake.1.army {
                        withdraw_amount = withdraw_amount.checked_add(stake.1.amount)?;
                    }

                    // Remove stake so player can't call twice and to save space
                    self.stakes
                        .remove(ctx.deps.storage, (stake.1.army, bf.id, &ctx.info.sender))?;
                }
                // Handle tie
                None => {
                    withdraw_amount = withdraw_amount.checked_add(stake.1.amount)?;
                }
            }
        }

        println!("withdraw_amount: {:?}", withdraw_amount);

        // Load game winner and prize pool
        let game_winner = self.winner.load(ctx.deps.storage)?;
        let prize_pool = self.prize_pool.load(ctx.deps.storage)?;

        println!("======");
        println!("game_winner: {:?}", game_winner);
        println!("prize_pool: {:?}", prize_pool);

        // Load the total amount the player staked to the winning army
        let players_stake = self
            .player_totals_by_army
            .may_load(ctx.deps.storage, (&ctx.info.sender, game_winner.id))?;

        println!("Players stake: {:?}", players_stake);

        match players_stake {
            Some(players_stake) => {
                // TODO this math may have edge cases?
                // Calculate players share of the prize pool
                // players stake * prize pool / total staked on winning army
                let winnings = players_stake
                    .checked_mul(prize_pool)?
                    .checked_div(game_winner.total_staked)?;

                println!("WINNNNNERRR: {:?}", winnings);

                // Add player's share of the prize pool to the withdraw_amount
                withdraw_amount = withdraw_amount.checked_add(winnings)?;
            }
            None => (),
        }

        println!("final withdraw_amount: {:?}", withdraw_amount);

        let mut resp = Response::new()
            .add_attribute("action", "withdraw")
            .add_attribute("amount", withdraw_amount.to_string());

        // If there is an amount to withdraw, add bank send message
        if withdraw_amount != Uint128::zero() {
            resp = resp.add_message(BankMsg::Send {
                to_address: ctx.info.sender.to_string(),
                amount: vec![Coin {
                    amount: withdraw_amount,
                    denom: config.denom,
                }],
            });
        }

        Ok(resp)
    }

    /// Queries an army by id.
    #[msg(query)]
    pub fn army(&self, ctx: QueryCtx, id: u8) -> StdResult<Army> {
        self.armies.load(ctx.deps.storage, id)
    }

    /// Returns a list of armies
    #[msg(query)]
    pub fn armies(&self, ctx: QueryCtx) -> StdResult<Vec<Army>> {
        Ok(self
            .armies
            .range(ctx.deps.storage, None, None, Order::Ascending)
            .map(|a| a.unwrap().1)
            .collect::<Vec<Army>>())
    }

    /// Queries a battlefield by id.
    #[msg(query)]
    pub fn battlefield(&self, ctx: QueryCtx, id: u8) -> StdResult<Battlefield> {
        self.battlefields.load(ctx.deps.storage, id)
    }

    /// Returns a list of battlefields
    #[msg(query)]
    pub fn battlefields(&self, ctx: QueryCtx) -> StdResult<Vec<Battlefield>> {
        Ok(self
            .battlefields
            .range(ctx.deps.storage, None, None, Order::Ascending)
            .map(|bf| bf.unwrap().1)
            .collect::<Vec<Battlefield>>())
    }

    /// Returns information about the game configuration
    #[msg(query)]
    pub fn config(&self, ctx: QueryCtx) -> StdResult<Config> {
        self.config.load(ctx.deps.storage)
    }

    /// Essential player info
    /// - How much has a player staked?
    /// - Which battlefeilds are they staked in? (their list of stakes)
    pub fn player_info(&self, ctx: QueryCtx, player: String) -> StdResult<PlayerInfoResponse> {
        // Validate player address
        let player_addr = ctx.deps.api.addr_validate(&player)?;

        let stakes = self
            .stakes
            .idx
            .player
            .prefix(player_addr)
            .range(ctx.deps.storage, None, None, Order::Ascending)
            .collect::<StdResult<Vec<_>>>()?;

        unimplemented!()
    }

    /// Returns information about the game status
    #[msg(query)]
    pub fn status(&self, ctx: QueryCtx) -> StdResult<StatusResponse> {
        Ok(StatusResponse {
            game_phase: self.phase.load(ctx.deps.storage)?,
            winner: self.winner.may_load(ctx.deps.storage)?,
        })
    }
}
