use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cosmwasm_std::{Timestamp, Uint128};
use cw_storage_plus::{Index, IndexList, MultiIndex};

/// Army Info used for instantiation
#[cw_serde]
pub struct ArmyInfo {
    pub name: String,
    pub ipfs_uri: Option<String>,
}

/// Holds army state
#[cw_serde]
pub struct Army {
    /// The Army name
    pub name: String,
    /// Additional metadata about the army stored offchain
    pub ipfs_uri: Option<String>,
    /// The id for the Army
    pub id: u8,
    /// The total amount staked for the Army across all battlefields
    pub total_staked: Uint128,
    /// The total victory points for the army, set on game end
    pub victory_points: u64,
}

/// Holds information about a particular battlefield
#[cw_serde]
pub struct Battlefield {
    /// The Battlefield name
    pub name: String,
    /// Additional metadata about the battlefield stored offchain
    pub ipfs_uri: Option<String>,
    /// The Battlefield ID
    pub id: u8,
    /// The victory point value of the particular battle field
    pub value: u64,
    /// Winner
    pub winner: Option<u8>,
}

/// Battlefield info used for instantiation
#[cw_serde]
pub struct BattlefieldInfo {
    /// The Battlefield name
    pub name: String,
    /// Additional metadata about the battlefield stored offchain
    pub ipfs_uri: Option<String>,
    /// The victory point value of the particular battle field
    pub value: u64,
}

/// Global configuration for the game
#[cw_serde]
pub struct Config {
    /// Game start time
    pub start: Timestamp,
    /// The duration of the game
    pub battle_duration: Timestamp,
    /// The price of staking a soldier on a battlefield
    pub denom: String,
    // /// TODO implment an optional fee for game creators
    // /// An optional fee collected for the game creator
    // pub fee: Option<Decimal>,
}

/// The possible phases of the game
#[cw_serde]
pub enum GamePhase {
    NotStarted,
    Open,
    Closed,
}

/*
 * TODO multi-index (battlefield, army, player):
 * - query total staked
 * - query player total staked
 * - query battlefield total staked
 * - query battlefield by army total staked
 * - query army total taked
 * - query player staked on battlefield
 *
 * Once the game finishes:
 * - query withdrawable amount
 */

/// Represents a battle field stake
#[cw_serde]
pub struct StakeInfo {
    pub amount: Uint128,
    pub army: u8,
    pub battlefield_id: u8,
    pub player: Addr,
}

pub fn army_idx(_pk: &[u8], d: &StakeInfo) -> u8 {
    d.army.clone()
}

pub fn battlefield_id_idx(_pk: &[u8], d: &StakeInfo) -> u8 {
    d.battlefield_id.clone()
}

pub fn player_idx(_pk: &[u8], d: &StakeInfo) -> Addr {
    d.player.clone()
}

/// Indexed map for stakes by player
pub struct StakeIndexes<'a> {
    pub army: MultiIndex<'a, u8, StakeInfo, String>,
    pub battlefield_id: MultiIndex<'a, u8, StakeInfo, String>,
    pub player: MultiIndex<'a, Addr, StakeInfo, String>,
}

impl<'a> IndexList<StakeInfo> for StakeIndexes<'a> {
    fn get_indexes(&'_ self) -> Box<dyn Iterator<Item = &'_ (dyn Index<StakeInfo> + '_)> + '_> {
        let v: Vec<&dyn Index<StakeInfo>> = vec![&self.army, &self.battlefield_id, &self.player];
        Box::new(v.into_iter())
    }
}
