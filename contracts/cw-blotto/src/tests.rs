use cosmwasm_std::{coins, Addr, Timestamp, Uint128};
use cw_utils::{Expiration, PaymentError};
use sylvia::cw_multi_test::App as MtApp;
use sylvia::multitest::App;

use crate::{
    contract::{multitest_utils::CodeId, InstantiateMsgData},
    state::{ArmyInfo, BattlefieldInfo, GamePhase, StakingLimitConfig},
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
fn test_instantiate_in_past() {
    let app = App::default();
    let code_id = CodeId::store_code(&app);

    // Start time error
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
            battlefields: vec![BattlefieldInfo {
                name: "The Citadel".to_string(),
                description: Some("awesome battlefield".to_string()),
                image_uri: Some("https://example.com/image.jpg".to_string()),
                ipfs_uri: None,
                value: 5,
            }],
            battle_duration: Timestamp::from_seconds(100),
            denom: DENOM.to_string(),
            start_time: Some(Timestamp::from_seconds(1)),
            staking_limit_config: None,
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap_err();

    // Get current time in seconds
    let now = app.app().block_info().time.seconds();

    // Assert that the start time is in the past
    assert_eq!(
        err,
        ContractError::InvalidStartTime {
            now: now,
            start_time: 1
        }
    )
}

#[test]
fn test_instantiate_in_future() {
    let app = MtApp::new(|router, _api, storage| {
        router
            .bank
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(300, DENOM))
            .unwrap();
    });
    let app = App::new(app);
    let code_id = CodeId::store_code(&app);

    let start_time = Timestamp::from_seconds(&app.app().block_info().time.seconds() + 100);

    // Start time error
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
            battlefields: vec![BattlefieldInfo {
                name: "The Citadel".to_string(),
                description: Some("awesome battlefield".to_string()),
                image_uri: Some("https://example.com/image.jpg".to_string()),
                ipfs_uri: None,
                value: 5,
            }],
            battle_duration: Timestamp::from_seconds(100),
            denom: DENOM.to_string(),
            start_time: Some(start_time),
            staking_limit_config: None,
        })
        .with_label("cw-blotto contract")
        .call(CREATOR)
        .unwrap();

    // Assert the match has not started, because it starts in the future
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::NotStarted);

    // Query armies
    let armies = blotto.armies().unwrap();

    // Query battlefields
    let battlefields = blotto.battlefields().unwrap();

    // Attempt to stake (fails)
    let err = blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_1)
        .unwrap_err();

    // Assert that staking fails due to game not being open
    assert_eq!(err, ContractError::NotOpen {});

    // Time passes for the game to start
    app.update_block(|b| b.time = b.time.plus_seconds(100));

    // Attempt to stake again
    blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_1)
        .unwrap();

    // Assert that the phase has been updated to open
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Open);

    // Time passes for the game to end
    app.update_block(|b| b.time = b.time.plus_seconds(100));

    // Tally the game
    blotto.tally().call(PLAYER_1).unwrap();

    // Assert that the game is closed
    let phase = blotto.status().unwrap().game_phase;
    assert_eq!(phase, GamePhase::Closed);
}

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
            staking_limit_config: None,
            start_time: None,
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
            staking_limit_config: None,
            start_time: None,
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
            staking_limit_config: None,
            start_time: None,
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
            .init_balance(storage, &Addr::unchecked(PLAYER_1), coins(1000, DENOM))
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
            staking_limit_config: Some(StakingLimitConfig {
                amount: Uint128::from(250u128),
                cooldown: cw_utils::Duration::Height(10u64),
            }),
            start_time: None,
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

    // Staking over the limit fails
    let err = blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(251, DENOM))
        .call(PLAYER_1)
        .unwrap_err();

    assert_eq!(
        err,
        ContractError::StakingLimit {
            amount: Uint128::from(250u128),
            expiration: Expiration::AtHeight(12355u64)
        }
    );

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

    // Cannot stake over the limit within period
    let err = blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(101, DENOM))
        .call(PLAYER_1)
        .unwrap_err();

    assert_eq!(
        err,
        ContractError::StakingLimit {
            amount: Uint128::from(100u128),
            expiration: Expiration::AtHeight(12355u64)
        }
    );

    // Ensure limit resets after expiration
    app.update_block(|x| x.height += 10);

    let err = blotto
        .stake(armies[0].id, battlefields[0].id)
        .with_funds(&coins(251, DENOM))
        .call(PLAYER_1)
        .unwrap_err();

    assert_eq!(
        err,
        ContractError::StakingLimit {
            amount: Uint128::from(250u128),
            expiration: Expiration::AtHeight(12365u64)
        }
    );

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
fn test_tie() {
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
            staking_limit_config: None,
            start_time: None,
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
        .stake(armies[1].id, battlefields[0].id)
        .with_funds(&coins(100, DENOM))
        .call(PLAYER_4)
        .unwrap();

    // Time passes
    app.update_block(|b| b.time = b.time.plus_seconds(60 * 60 * 24));

    // TODO this should be a tie, there should be no winner
    // Tally succeeds
    let res = blotto.tally().call(CREATOR).unwrap();
    println!("RESULT {:?}", res);

    // // Check red victory
    // assert_eq!("red".to_string(), res.events[1].attributes[2].value);
    // assert_eq!("1".to_string(), res.events[1].attributes[3].value);

    // // Check game phase has been updated
    // let phase = blotto.status().unwrap().game_phase;
    // assert_eq!(phase, GamePhase::Closed);

    // // Player one get's to withdraw their balance from winning the battlefield
    // // As well as additional prize winnings
    // let res = blotto.withdraw().call(PLAYER_1).unwrap();
}
