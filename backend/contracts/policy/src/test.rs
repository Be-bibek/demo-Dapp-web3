#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, PolicyContract);
    let client = PolicyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.init_policy(&admin);

    assert_eq!(client.is_authorized(&user), false);

    client.authorize(&user);
    assert_eq!(client.is_authorized(&user), true);

    client.revoke(&user);
    assert_eq!(client.is_authorized(&user), false);
}
