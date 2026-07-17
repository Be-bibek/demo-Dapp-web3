"use client";

import React, { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { sendXLM } from '@/lib/stellar';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function TransferPage() {
  const { publicKey, refreshBalance } = useWalletStore();
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!destination || !amount) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Simulating transaction...", { id: "tx" });

    try {
      const hash = await sendXLM(publicKey, destination, amount);
      toast.success(
        <div className="flex flex-col gap-1">
          <span>Transaction Confirmed!</span>
          <a 
            href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View on Stellar Expert
          </a>
        </div>, 
        { id: "tx" }
      );
      await refreshBalance();
      setDestination('');
      setAmount('');
    } catch (error: any) {
      toast.error(`Transaction Failed: ${error.message}`, { id: "tx" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h1 className="text-4xl font-bold tracking-tight text-center md:text-left mb-8">Transfer Funds</h1>
      
      <div className="glass rounded-3xl p-6 md:p-10 max-w-xl mx-auto relative overflow-hidden shadow-2xl shadow-primary/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        
        <form onSubmit={handleTransfer} className="space-y-6 relative z-10">
          <div className="space-y-2 p-5 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <label className="text-sm font-semibold text-muted-foreground">Destination Address / Contract ID</label>
            <input 
              type="text" 
              placeholder="G..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-transparent border-b border-border/50 py-2 outline-none focus:border-primary transition-all disabled:opacity-50 font-mono text-lg text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          
          <div className="space-y-2 p-5 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <label className="text-sm font-semibold text-muted-foreground">Amount</label>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="number" 
                step="0.0000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-transparent text-4xl font-bold outline-none text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
              />
              <span className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-bold shadow-sm">XLM</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !publicKey}
            className="w-full py-4 mt-6 bg-gradient-to-r from-primary to-blue-500 text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={20} />}
            {isSubmitting ? "Processing..." : "Review Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
