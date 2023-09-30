use crate::{
    contract::{multitest_utils::BlottoContractProxy, InstantiateMsgData},
    ContractError,
};
use cosmwasm_std::{to_binary, Addr, Empty, StdError, Timestamp};
use sylvia::multitest::App;

use crate::contract::multitest_utils::CodeId;
use crate::state::{Army, ArmyInfo, Battlefield, BattlefieldInfo};

const CREATOR: &str = "creator";
const DENOM: &str = "ujuno";
const RANDOM: &str = "random";

// pub struct TestCase<'a, T> {
//     blotto_contract: BlottoContractProxy<'a, T>,
// }

// impl TestCase<'_, T> {
//     // Lifetimes with Sylvia are fun. Open to a better way of doing this
//     pub fn new<'b, T>(app: &'b App<T>) -> TestCase<'b, T> {
//         let code_id = CodeId::store_code(app);

//         TestCase::<'b> {
//             blotto_contract: code_id
//                 .instantiate(InstantiateMsgData {
//                     armies: vec![ArmyInfo {
//                         name: "red".to_string(),
//                         ipfs_uri: None,
//                     }],
//                     battlefields: vec![],
//                     battle_duration: Timestamp::from_seconds(10000),
//                     denom: DENOM.to_string(),
//                 })
//                 .with_label("cw-blotto contract")
//                 .call(CREATOR)
//                 .unwrap(),
//         }
//     }
// }

#[test]
fn test_instantiate() {
    let app = App::default();
    let code_id = CodeId::store_code(&app);

    let _blotto_contract = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![ArmyInfo {
                name: "red".to_string(),
                ipfs_uri: None,
            }],
            battlefields: vec![],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();
}
