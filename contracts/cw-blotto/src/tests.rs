use cosmwasm_std::{coins, Addr, Timestamp, Uint128};
use cw_utils::PaymentError;
use sylvia::cw_multi_test::App as MtApp;
use sylvia::multitest::App;

use crate::{
    contract::{multitest_utils::CodeId, InstantiateMsgData},
    state::{ArmyInfo, BattlefieldInfo, GamePhase},
    ContractError,
};

const CREATOR: &str = "creator";
const DENOM: &str = "ujuno";
const PLAYER_1: &str = "player1";
const PLAYER_2: &str = "player2";
const PLAYER_3: &str = "player3";
const PLAYER_4: &str = "player4";
const PLAYER_5: &str = "player5";
const NON_PLAYER: &str = "nonplayer";

#[test]
fn test_instantiate_no_battlefields_fails() {
    let app = App::default();
    let code_id = CodeId::store_code(&app);

    // No battlefields errors
    let err = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![
                ArmyInfo {
                    name: "red".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
                ArmyInfo {
                    name: "blue".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
            ],
            battlefields: vec![],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap_err();

    assert_eq!(
        err,
        ContractError::InvalidBattlefieldCount { max_limit: 10 }
    )
}

#[test]
fn test_instantiate_no_armies_fails() {
    let app = App::default();
    let code_id = CodeId::store_code(&app);

    // No armies errors
    let err = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![],
            battlefields: vec![BattlefieldInfo {
                name: "The Citadel".to_string(),
                description: Some("awesome battlefield".to_string()),
                image_uri: Some("https://example.com/image.jpg".to_string()),
                ipfs_uri: None,
                value: 2,
            }],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap_err();

    assert_eq!(err, ContractError::InvalidArmyCount { max_limit: 5 })
}

#[test]
fn test_instantiate_one_army_fails() {
    let app = App::default();
    let code_id = CodeId::store_code(&app);

    // Only one army fails
    let err = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![ArmyInfo {
                name: "red".to_string(),
                description: Some("awesome army".to_string()),
                image_uri: Some("https://example.com/image.jpg".to_string()),
                ipfs_uri: None,
            }],
            battlefields: vec![BattlefieldInfo {
                name: "The Citadel".to_string(),
                description: Some("awesome battlefield".to_string()),
                image_uri: Some("https://example.com/image.jpg".to_string()),
                ipfs_uri: None,
                value: 2,
            }],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap_err();

    assert_eq!(err, ContractError::InvalidArmyCount { max_limit: 5 })
}

#[test]
fn test_happy_path() {
    let app = MtApp::new(|router, _api, storage| {
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_2), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_3), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_4), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_5), coins(300, DENOM))
            .unwrap();
    });
    let app = App::new(app);

    let code_id = CodeId::store_code(&app);

    let blotto = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![
                ArmyInfo {
                    name: "red".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
                ArmyInfo {
                    name: "blue".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
            ],
            battlefields: vec![
                BattlefieldInfo {
                    name: "The Citadel".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 5,
                },
                BattlefieldInfo {
                    name: "Forest Zone".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 3,
                },
                BattlefieldInfo {
                    name: "Coastal Port".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 3,
                },
            ],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();

    // Query game phase is open
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Open);

    // Query armies
    let armies = blotto.armies().unwrap();

    // Query battlefields
    let battlefields = blotto.battlefields().unwrap();

    // Stake without funds fails
    let err = blotto
        .stake(armies[0].id, battlefields[0].id)
        .call(CREATOR)
        .unwrap_err();

    assert_eq!(err, ContractError::PaymentError(PaymentError::NoFunds {}));

    // Players stake on different battlefields
    blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(150, DENOM))
        .call(PLAYER_1)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_2)
        .unwrap();
    blotto
        .stake(armies[0].id, battlefields[1].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_3)
        .unwrap();
    blotto
        .stake(armies[0].id, battlefields[2].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[1].id)
        .with_funds(&coins(200, DENOM))
        .call(PLAYER_5)
        .unwrap();

    // Test army total query
    let res = blotto
        .army_totals_by_battlefield(armies[0].id, battlefields[0].id)
        .unwrap();
    assert_eq!(res, Uint128::new(150));

    // Tally the game fails as time has not elapsed
    let err = blotto.tally().call(CREATOR).unwrap_err();
    assert_eq!(err, ContractError::NotOver {});

    // Time passes
    app.update_block(|b| b.time = b.time.plus_seconds(60 * 60 * 24));

    // Tally succeeds
    let res = blotto.tally().call(CREATOR).unwrap();

    // Check red victory
    assert_eq!("red".to_string(), res.events[1].attributes[2].value);
    assert_eq!("1".to_string(), res.events[1].attributes[3].value);

    // Check game phase has been updated
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Closed);

    // Player can't stake when game is over
    let err = blotto
        .stake(armies[0].id, battlefields[2].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap_err();
    assert_eq!(err, ContractError::NotOpen {});

    // Non-player can't withdraw anything
    let err = blotto.withdraw().call(NON_PLAYER).unwrap_err();
    assert_eq!(err, ContractError::NothingToClaim {});

    // Player one get's to withdraw their 150 balance from winning the battlefield
    // As well as additional prize winnings
    let res = blotto.withdraw().call(PLAYER_1).unwrap();
    assert_eq!("235".to_string(), res.events[1].attributes[2].value);

    // Player can't call withdraw twice
    let err = blotto.withdraw().call(PLAYER_1).unwrap_err();
    assert_eq!(err, ContractError::NothingToClaim {});

    // Player 2 gets nothing
    let res = blotto.withdraw().call(PLAYER_2).unwrap();
    assert_eq!("0".to_string(), res.events[1].attributes[2].value);

    // Player 3 looses 100 staked on loosing battlefield, but wins prize for
    // fighting with the winning army
    let res = blotto.withdraw().call(PLAYER_3).unwrap();
    assert_eq!("57".to_string(), res.events[1].attributes[2].value);

    // Player 4 gets their 100 stake back plus prize winnings
    let res = blotto.withdraw().call(PLAYER_4).unwrap();
    assert_eq!("157".to_string(), res.events[1].attributes[2].value);

    // Player 5 gets 200 back for winning the battlefield, but nothing else
    // as they fought with the loosing army
    let res = blotto.withdraw().call(PLAYER_5).unwrap();
    assert_eq!("200".to_string(), res.events[1].attributes[2].value);
}

// Handles the edge case where no one plays the game
#[test]
fn test_no_one_plays() {}

#[test]
fn test_battlefield_tie() {
    let app = MtApp::new(|router, _api, storage| {
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_2), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_3), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_4), coins(300, DENOM))
            .unwrap();
    });
    let app = App::new(app);

    let code_id = CodeId::store_code(&app);

    let blotto = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![
                ArmyInfo {
                    name: "red".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
                ArmyInfo {
                    name: "blue".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
            ],
            battlefields: vec![
                BattlefieldInfo {
                    name: "The Citadel".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 5,
                },
                BattlefieldInfo {
                    name: "Forest Zone".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 3,
                },
            ],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();

    // Query armies and battlefields
    let armies = blotto.armies().unwrap();
    let battlefields = blotto.battlefields().unwrap();

    // Players stake equally on the first battlefield
    blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_1)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_2)
        .unwrap();
    blotto
        .stake(armies[0].id, battlefields[1].id)
        .with_funds(&coins(50, DENOM))
        .call(PLAYER_3)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[1].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap();

    // Time passes
    app.update_block(|b| b.time = b.time.plus_seconds(60 * 60 * 24));

    // Tally succeeds
    let res = blotto.tally().call(CREATOR).unwrap();
    println!("RESULT {:?}", res);

    // Check blue victory
    assert_eq!("blue".to_string(), res.events[1].attributes[2].value);
    assert_eq!("2".to_string(), res.events[1].attributes[3].value);

    // Check game phase has been updated
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Closed);

    // Player 1 gets 100 for bf tie
    let res = blotto.withdraw().call(PLAYER_1).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);

    // Player 2 gets 100 for bf tie + 25 prize pool part
    let res = blotto.withdraw().call(PLAYER_2).unwrap();
    assert_eq!("125".to_string(), res.events[1].attributes[2].value);

    // Player 3 gets nothing
    let res = blotto.withdraw().call(PLAYER_3).unwrap();
    assert_eq!("0".to_string(), res.events[1].attributes[2].value);

    // Player 4 gets 100 initial stake + 25 prize pool part
    let res = blotto.withdraw().call(PLAYER_4).unwrap();
    assert_eq!("125".to_string(), res.events[1].attributes[2].value);
}

#[test]
fn test_game_tie_same_stakes() {
    let app = MtApp::new(|router, _api, storage| {
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_2), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_3), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_4), coins(300, DENOM))
            .unwrap();
    });
    let app = App::new(app);

    let code_id = CodeId::store_code(&app);

    let blotto = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![
                ArmyInfo {
                    name: "red".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
                ArmyInfo {
                    name: "blue".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
            ],
            battlefields: vec![
                BattlefieldInfo {
                    name: "The Citadel".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 5,
                },
                BattlefieldInfo {
                    name: "Forest Zone".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 3,
                },
            ],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();

    // Query armies and battlefields
    let armies = blotto.armies().unwrap();
    let battlefields = blotto.battlefields().unwrap();

    // Players stake equally on different battlefields
    blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_1)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_2)
        .unwrap();
    blotto
        .stake(armies[0].id, battlefields[1].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_3)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[1].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap();

    // Time passes
    app.update_block(|b| b.time = b.time.plus_seconds(60 * 60 * 24));

    // Tally succeeds
    let res = blotto.tally().call(CREATOR).unwrap();
    println!("RESULT {:?}", res);

    // Check game phase has been updated
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Closed);

    // All players 1-4 gets their stake 100 back for a game tie,
    // but nothing else as there was no winner
    let res = blotto.withdraw().call(PLAYER_1).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_2).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_3).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_4).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);
}

#[test]
fn test_game_tie_diff_stakes() {
    let app = MtApp::new(|router, _api, storage| {
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_2), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_3), coins(300, DENOM))
            .unwrap();
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_4), coins(300, DENOM))
            .unwrap();
    });
    let app = App::new(app);

    let code_id = CodeId::store_code(&app);

    let blotto = code_id
        .instantiate(InstantiateMsgData {
            armies: vec![
                ArmyInfo {
                    name: "red".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
                ArmyInfo {
                    name: "blue".to_string(),
                    description: Some("awesome army".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                },
            ],
            battlefields: vec![
                BattlefieldInfo {
                    name: "The Citadel".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 5,
                },
                BattlefieldInfo {
                    name: "Forest Zone".to_string(),
                    description: Some("awesome battlefield".to_string()),
                    image_uri: Some("https://example.com/image.jpg".to_string()),
                    ipfs_uri: None,
                    value: 5,
                },
            ],
            battle_duration: Timestamp::from_seconds(10000),
            denom: DENOM.to_string(),
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();

    // Query armies and battlefields
    let armies = blotto.armies().unwrap();
    let battlefields = blotto.battlefields().unwrap();

    // Players stake equally on different battlefields
    blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_1)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[0].id)
        .with_funds(&coins(50, DENOM))
        .call(PLAYER_2)
        .unwrap();
    blotto
        .stake(armies[0].id, battlefields[1].id)
        .with_funds(&coins(50, DENOM))
        .call(PLAYER_3)
        .unwrap();
    blotto
        .stake(armies[1].id, battlefields[1].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap();

    // Time passes
    app.update_block(|b| b.time = b.time.plus_seconds(60 * 60 * 24));

    // Tally succeeds
    let res = blotto.tally().call(CREATOR).unwrap();
    println!("RESULT {:?}", res);

    // Check game phase has been updated
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Closed);

    // Player 1 and 4 gets their stakes because they won the bf
    // But no prize pool on top as game ended with a tie on victory points
    let res = blotto.withdraw().call(PLAYER_1).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_2).unwrap();
    assert_eq!("0".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_3).unwrap();
    assert_eq!("0".to_string(), res.events[1].attributes[2].value);

    let res = blotto.withdraw().call(PLAYER_4).unwrap();
    assert_eq!("100".to_string(), res.events[1].attributes[2].value);
}
