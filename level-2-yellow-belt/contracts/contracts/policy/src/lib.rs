#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contract]
pub struct PolicyContract;

#[contracttype]
pub enum DataKey {
    Admin,
    Authorized(Address),
}

#[contractimpl]
impl PolicyContract {
    /// Initialize the policy contract with an admin.
    pub fn init_policy(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Authorize a user (only admin).
    pub fn authorize(env: Env, user: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().persistent().set(&DataKey::Authorized(user), &true);
    }
    
    /// Revoke authorization (only admin).
    pub fn revoke(env: Env, user: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().persistent().remove(&DataKey::Authorized(user));
    }

    /// Check if a user is authorized.
    pub fn is_authorized(env: Env, user: Address) -> bool {
        env.storage().persistent().get(&DataKey::Authorized(user)).unwrap_or(false)
    }
}

mod test;
