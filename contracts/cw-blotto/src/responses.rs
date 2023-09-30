use cosmwasm_schema::cw_serde;

use crate::state::{Battlefield, GamePhase};

#[cw_serde]
pub struct StatusResponse {
    pub game_phase: GamePhase,
}

#[cw_serde]
pub struct PlayerInfoResponse {}
