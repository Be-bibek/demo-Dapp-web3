import { create } from 'zustand';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { fetchBalance, fetchTransactions, TransactionRecord } from '@/lib/stellar';

// Initialize the kit instance once
if (typeof window !== 'undefined') {
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: "TESTNET" as any,
  });
}

// Export for other modules like stellar.ts
export const kit = StellarWalletsKit;

interface WalletState {
  publicKey: string | null;
  balance: string;
  transactions: TransactionRecord[];
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setBalance: (balance: string) => void;
  refreshBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  publicKey: null,
  balance: '0',
  transactions: [],
  isConnecting: false,
  
  connect: async () => {
    set({ isConnecting: true });
    try {
      const { address } = await StellarWalletsKit.authModal();
      set({ publicKey: address });
      const bal = await fetchBalance(address);
      const txs = await fetchTransactions(address);
      set({ balance: bal, transactions: txs });
    } catch (e) {
      console.error("Wallet modal error:", e);
    } finally {
      set({ isConnecting: false });
    }
  },
  
  refreshBalance: async () => {
    const pk = get().publicKey;
    if (pk) {
      const bal = await fetchBalance(pk);
      const txs = await fetchTransactions(pk);
      set({ balance: bal, transactions: txs });
    }
  },
  
  disconnect: () => {
    set({ publicKey: null, balance: '0', transactions: [] });
  },
  setBalance: (balance) => set({ balance }),
}));
