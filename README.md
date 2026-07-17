# Stellar Monorepo Submission - Levels 1, 2, and 3

This repository contains the complete progression for the Stellar hackathon/course, neatly organized into `level-1`, `level-2`, and `level-3` directories exactly as required by the evaluator.

## Live Demo
**Live Demo URL:** [https://demo-dapp-web3.vercel.app](https://demo-dapp-web3.vercel.app)
*(Note: Ensure you connect to the Vercel project with the Root Directory set to `level-3-orange-belt/frontend`)*

---

## 🏆 Assessment - Level 3: Orange Belt (Final DApp)

Our final level 3 application is a comprehensive web3 platform built on Next.js, featuring complex Soroban cross-contract authentication and real-time live events.

### Proof of Functionality (Level 3 Screenshots)

1. **Mobile Responsive UI:**
   <!-- TODO: Replace the path below with a real screenshot of your app on a phone size -->
   ![Mobile Responsive UI](./assets/mobile_ui.png)

2. **CI/CD Pipeline Running Successfully:**
   <!-- TODO: Replace the path below with a real screenshot of the green checkmarks in GitHub Actions -->
   ![CI/CD Pipeline](./assets/ci_cd_success.png)

3. **Terminal Output (3+ Passing Tests):**
   <!-- TODO: Replace the path below with a real screenshot of `cargo test` passing -->
   ![Cargo Test Output](./assets/cargo_test_success.png)

### Contract Deployment Details (Level 3)
* **Deployed Escrow Contract Address:** `CBV2MQLH3H2W72N3LQKJ3V4X37O3X2Y7IEM7M5UGBR5HFF6LOMU7744I` *(Placeholder - Update this!)*
* **Transaction hash of a contract call:** `5d8b8e019fb9b0f92d4b9f33f07a221f7e34f8263529321490209805be4f2d34` *(Placeholder - Update this!)*

---

## 🥈 Assessment - Level 2: Yellow Belt

The Level 2 submission introduces the Soroban smart contracts (Time-Locked Escrow and Policy Authenticator) integrated into the upgraded React frontend.

### Proof of Functionality (Level 2 Screenshots)

1. **Wallet Options Available:**
   <!-- TODO: Replace the path below with a real screenshot of the Wallet Kit modal showing Freighter/Albedo -->
   ![Wallet Connect Modal](./assets/wallet_modal.png)

### Contract Deployment Details (Level 2)
* **Deployed Contract Address:** `CAISSVEWZWEGK66CWHUVV2YQHLSUXBHDZVGDIZ57BVXAP2D4T6QZAGKN`
* **Transaction hash of a contract call:** `e2e7188ff6e65b066d5b94f1076fcc8c2bcf5e7b2fcfd6b8b9b4f99b9cf2a58b` *(Placeholder - Update this!)*

---

## 🥉 Assessment - Level 1: White Belt

The foundation of the project containing the basic Next.js frontend with the Stellar Wallets Kit and Horizon API integration to display the user's XLM balance.

---

## CI/CD Pipeline
This repository includes a strict `ci.yml` pipeline in the `.github/workflows/` directory that automatically tests the Rust smart contracts and builds the Next.js frontend upon every push to the `main` branch.

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Be-bibek/demo-Dapp-web3.git
   cd demo-Dapp-web3
   ```

2. **Navigate to the final Level 3 code:**
   ```bash
   cd level-3-orange-belt/frontend
   npm install
   npm run dev
   ```

3. **Test the Smart Contracts:**
   ```bash
   cd level-3-orange-belt/contracts
   cargo test
   ```

