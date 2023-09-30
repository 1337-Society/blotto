use cosmwasm_schema::write_api;
use cw_blotto::contract::{ContractExecMsg, ContractQueryMsg, InstantiateMsg};

fn main() {
    write_api! {
        instantiate: InstantiateMsg,
        query: ContractQueryMsg,
        execute: ContractExecMsg,
    }
}
