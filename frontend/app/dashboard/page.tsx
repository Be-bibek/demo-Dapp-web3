"use client";

import React, { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import Link from 'next/link';
import { fundWithFriendbot } from '@/lib/stellar';
import { toast } from 'sonner';
import { Loader2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { publicKey, balance, transactions, refreshBalance } = useWalletStore();
  const [isFunding, setIsFunding] = useState(false);

  const handleFund = async () => {
    if (!publicKey) return;
    setIsFunding(true);
    toast.loading("Requesting funds from Friendbot...", { id: "fund" });
    try {
      await fundWithFriendbot(publicKey);
      toast.success("Account funded successfully!", { id: "fund" });
      await refreshBalance();
    } catch (error: any) {
      toast.error(error.message || "Failed to fund account.", { id: "fund" });
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Treasury Dashboard</h1>
        {publicKey && (
          <button 
            onClick={handleFund} 
            disabled={isFunding}
            className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isFunding && <Loader2 className="animate-spin" size={16} />}
            Testnet Faucet
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass rounded-2xl p-6 border-l-4 border-l-primary">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">Available Balance</h2>
          <div className="text-5xl font-bold text-foreground">{balance} <span className="text-2xl text-muted-foreground">XLM</span></div>
        </div>
        
        <div className="md:col-span-2 glass rounded-2xl p-6">
          <h2 className="text-lg font-medium text-muted-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/transfer" className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-primary/30 text-center">
              Send Funds
            </Link>
            <Link href="/vault" className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-green-500/30 text-center">
              Escrow Vault
            </Link>
          </div>
        </div>
      </div>

      {publicKey && (
        <div className="glass rounded-2xl p-6 overflow-hidden">
          <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No recent transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 font-medium px-4">Action</th>
                    <th className="pb-3 font-medium px-4">Amount</th>
                    <th className="pb-3 font-medium px-4">Status</th>
                    <th className="pb-3 font-medium px-4">Date</th>
                    <th className="pb-3 font-medium px-4">Transaction Hash</th>
                    <th className="pb-3 font-medium px-4 text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-4 font-medium text-foreground">
                        {tx.action}
                      </td>
                      <td className="py-4 px-4 font-bold text-primary">
                        {tx.amount ? `${tx.amount} XLM` : '-'}
                      </td>
                      <td className="py-4 px-4">
                        {tx.successful ? (
                          <span className="flex items-center gap-2 text-green-500"><CheckCircle2 size={16} /> Success</span>
                        ) : (
                          <span className="flex items-center gap-2 text-destructive"><XCircle size={16} /> Failed</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm">
                        {tx.hash.substring(0, 16)}...{tx.hash.substring(tx.hash.length - 16)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          View <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
