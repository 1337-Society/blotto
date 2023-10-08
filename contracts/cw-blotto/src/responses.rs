use cosmwasm_schema::cw_serde;

use crate::state::{Army, Battlefield, GamePhase};

#[cw_serde]
pub struct StatusResponse {
    pub game_phase: GamePhase,
    pub winner: Option<Army>,
}

#[cw_serde]
pub struct PlayerInfoResponse {}
