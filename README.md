# Stellar Payment dApp - Level 1

A modern, decentralized application built on the Stellar Testnet. This dApp allows users to securely connect their Stellar wallets, view their XLM balance, send payments, and review their transaction history.

## Features

- **Wallet Connection**: Seamlessly connects to Stellar wallets using `@creit.tech/stellar-wallets-kit`. Supports Freighter, Albedo, xBull, and more.
- **Testnet Integration**: Fully integrated with the Stellar Testnet via `@stellar/stellar-sdk`.
- **Live Balances**: Fetches and displays native XLM balances directly from the Horizon network.
- **Transaction History**: Displays recent operations (Payments, Account Creation, Smart Contract Calls) complete with transferred amounts and Stellar Expert explorer links.
- **Dynamic UI**: Built with Next.js, Tailwind CSS, and shadcn/ui. Features a premium glassmorphism design, vibrant gradients, dark/light mode toggle, and a responsive interactive 3D starfield background powered by Three.js.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & custom glassmorphism utilities
- **State Management**: Zustand
- **Web3 Integration**: 
  - `@stellar/stellar-sdk`
  - `@creit.tech/stellar-wallets-kit`
- **Animations & 3D**: Framer Motion, Three.js, React Three Fiber

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Be-bibek/demo-Dapp-web3.git
   cd demo-Dapp-web3/frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Structure

- `frontend/app`: Next.js page routing and layout.
- `frontend/components`: Reusable UI components (Navbar, Backgrounds, etc.).
- `frontend/lib`: Core Stellar logic (`stellar.ts`) handling Horizon API calls.
- `frontend/store`: Zustand state management for wallet connections.

## Assessment - Level 1 Completed
- [x] Configure Freighter / Stellar Wallets Kit.
- [x] Connect to Stellar Testnet.
- [x] Fetch and display wallet balance.
- [x] Build simple payment interface.
- [x] Integrate Friendbot faucet for testnet funds.
- [x] Display robust transaction history.
