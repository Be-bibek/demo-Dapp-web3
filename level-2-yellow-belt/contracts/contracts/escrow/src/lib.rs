#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};
use policy::PolicyContractClient;

#[contract]
pub struct EscrowContract;

#[contracttype]
pub enum DataKey {
    Deposit(Address), // Maps a user to their deposit details
    Policy, // Stores the policy contract address
}

#[contracttype]
pub struct DepositDetail {
    pub amount: i128,
    pub unlock_time: u64,
}

#[contractimpl]
impl EscrowContract {
    /// Initialize with the policy contract address
    pub fn init_escrow(env: Env, policy_address: Address) {
        if env.storage().instance().has(&DataKey::Policy) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Policy, &policy_address);
    }

    /// Deposit funds into the escrow
    pub fn deposit(env: Env, from: Address, token: Address, amount: i128, unlock_time: u64) {
        from.require_auth();

        // Prevent overwriting active deposits
        if env.storage().persistent().has(&DataKey::Deposit(from.clone())) {
            panic!("User already has an active deposit");
        }

        // Transfer tokens to the contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Save deposit state
        let detail = DepositDetail { amount, unlock_time };
        env.storage().persistent().set(&DataKey::Deposit(from), &detail);
    }

    /// Withdraw funds if unlock time has passed and user is authorized by policy
    pub fn withdraw(env: Env, user: Address, token: Address) {
        user.require_auth();

        let policy_address: Address = env.storage().instance().get(&DataKey::Policy).expect("Contract not initialized");
        
        let detail: DepositDetail = env.storage().persistent().get(&DataKey::Deposit(user.clone())).expect("No active deposit found");

        if env.ledger().timestamp() < detail.unlock_time {
            panic!("TimeLockNotExpired");
        }

        let policy_client = PolicyContractClient::new(&env, &policy_address);
        if !policy_client.is_authorized(&user) {
            panic!("UnauthorizedPolicy");
        }

        // Transfer funds back
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &user, &detail.amount);

        // Clear deposit
        env.storage().persistent().remove(&DataKey::Deposit(user));
    }
}

mod test;
