#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient;

#[test]
fn test_escrow_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // 1. Deploy Policy Contract
    let policy_contract_id = env.register_contract(None, policy::PolicyContract);
    let policy_client = policy::PolicyContractClient::new(&env, &policy_contract_id);
    let admin = Address::generate(&env);
    policy_client.init_policy(&admin);

    // 2. Deploy Escrow Contract
    let escrow_contract_id = env.register_contract(None, EscrowContract);
    let escrow_client = EscrowContractClient::new(&env, &escrow_contract_id);
    escrow_client.init_escrow(&policy_contract_id);

    // 3. Setup Token
    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = TokenClient::new(&env, &token_contract_id);
    let token_admin_client = StellarAssetClient::new(&env, &token_contract_id);

    let user = Address::generate(&env);
    token_admin_client.mint(&user, &1000);

    // 4. Test Deposit
    assert_eq!(token_client.balance(&user), 1000);
    escrow_client.deposit(&user, &token_contract_id, &500, &100);
    assert_eq!(token_client.balance(&user), 500);
    assert_eq!(token_client.balance(&escrow_contract_id), 500);

    // 5. Fast forward time and Authorize user
    env.ledger().with_mut(|li| {
        li.timestamp = 150;
    });
    policy_client.authorize(&user);

    // 6. Test Withdraw
    escrow_client.withdraw(&user, &token_contract_id);
    assert_eq!(token_client.balance(&user), 1000);
    assert_eq!(token_client.balance(&escrow_contract_id), 0);
}
