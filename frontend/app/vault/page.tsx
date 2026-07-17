"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';
import { 
  Lock, Unlock, ExternalLink, Activity, CheckCircle2, 
  XCircle, Loader2, Clock, Shield, AlertTriangle, Zap 
} from 'lucide-react';
import {
  escrowDeposit, escrowWithdraw, subscribeToEscrowEvents, policyAuthorize,
  ESCROW_CONTRACT_ID, POLICY_CONTRACT_ID,
  TimeLockError, UserRejectedError, UnauthorizedPolicyError, InsufficientBalanceError
} from '@/lib/soroban';

// XLM Native Token contract on testnet
const XLM_CONTRACT = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

type TxStatus = 'idle' | 'pending' | 'success' | 'failed';

interface LiveEvent {
  id: string;
  type: string;
  hash: string;
  timestamp: Date;
}

export default function VaultPage() {
  const { publicKey, refreshBalance } = useWalletStore();

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [lockValue, setLockValue] = useState('5');
  const [lockUnit, setLockUnit] = useState('minutes');
  const [depositStatus, setDepositStatus] = useState<TxStatus>('idle');
  const [depositHash, setDepositHash] = useState('');

  // Withdraw state
  const [withdrawStatus, setWithdrawStatus] = useState<TxStatus>('idle');
  const [withdrawHash, setWithdrawHash] = useState('');

  // Auth state
  const [authStatus, setAuthStatus] = useState<TxStatus>('idle');
  const [authHash, setAuthHash] = useState('');

  // Live events
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Subscribe to blockchain events via SSE
  useEffect(() => {
    const unsub = subscribeToEscrowEvents((event) => {
      setLiveEvents(prev => [{
        id: event.hash,
        type: event.type,
        hash: event.hash,
        timestamp: new Date(),
      }, ...prev].slice(0, 8));
    });
    return unsub;
  }, []);

  const handleDeposit = useCallback(async () => {
    if (!publicKey) { toast.error('Please connect your wallet first.'); return; }
    if (!depositAmount || parseFloat(depositAmount) <= 0) { toast.error('Enter a valid deposit amount.'); return; }

    setDepositStatus('pending');
    setDepositHash('');
    toast.loading('Awaiting signature...', { id: 'deposit' });

    try {
      let multiplier = 60;
      if (lockUnit === 'hours') multiplier = 3600;
      if (lockUnit === 'days') multiplier = 86400;
      if (lockUnit === 'years') multiplier = 31536000;
      const totalSeconds = Math.max(60, parseInt(lockValue || '1') * multiplier);

      const hash = await escrowDeposit(
        publicKey,
        XLM_CONTRACT,
        depositAmount,
        totalSeconds,
      );
      setDepositStatus('success');
      setDepositHash(hash);
      toast.success('Funds locked in escrow!', { id: 'deposit' });
      setDepositAmount('');
      await refreshBalance();
    } catch (error: any) {
      setDepositStatus('failed');
      if (error instanceof TimeLockError) toast.error(error.message, { id: 'deposit' });
      else if (error instanceof UserRejectedError) toast.error(error.message, { id: 'deposit' });
      else if (error instanceof UnauthorizedPolicyError) toast.error(error.message, { id: 'deposit' });
      else if (error instanceof InsufficientBalanceError) toast.error(error.message, { id: 'deposit' });
      else toast.error(error.message || 'Transaction failed', { id: 'deposit' });
    }
  }, [publicKey, depositAmount, lockValue, lockUnit, refreshBalance]);

  const handleWithdraw = useCallback(async () => {
    if (!publicKey) { toast.error('Please connect your wallet first.'); return; }

    setWithdrawStatus('pending');
    setWithdrawHash('');
    toast.loading('Awaiting signature...', { id: 'withdraw' });

    try {
      const hash = await escrowWithdraw(publicKey, XLM_CONTRACT);
      setWithdrawStatus('success');
      setWithdrawHash(hash);
      toast.success('Funds withdrawn successfully!', { id: 'withdraw' });
      await refreshBalance();
    } catch (error: any) {
      setWithdrawStatus('failed');
      if (error instanceof TimeLockError) toast.error(error.message, { id: 'withdraw' });
      else if (error instanceof UserRejectedError) toast.error(error.message, { id: 'withdraw' });
      else if (error instanceof UnauthorizedPolicyError) toast.error(error.message, { id: 'withdraw' });
      else if (error instanceof InsufficientBalanceError) toast.error(error.message, { id: 'withdraw' });
      else toast.error(error.message || 'Withdrawal failed', { id: 'withdraw' });
    }
  }, [publicKey, refreshBalance]);

  const handleAuthorize = useCallback(async () => {
    if (!publicKey) { toast.error('Please connect your wallet first.'); return; }

    setAuthStatus('pending');
    setAuthHash('');
    toast.loading('Authorizing wallet...', { id: 'auth' });

    try {
      const hash = await policyAuthorize(publicKey, publicKey);
      setAuthStatus('success');
      setAuthHash(hash);
      toast.success('Wallet officially authorized by Policy!', { id: 'auth' });
    } catch (error: any) {
      setAuthStatus('failed');
      if (error instanceof UserRejectedError) toast.error(error.message, { id: 'auth' });
      else toast.error(error.message || 'Authorization failed', { id: 'auth' });
    }
  }, [publicKey]);

  return (
    <div className="flex-1 p-6 lg:p-12 w-full max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Escrow Vault</h1>
        <p className="text-muted-foreground">Lock XLM in a time-locked smart contract with policy-based withdrawals.</p>
      </div>

      {/* Contract IDs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Escrow Contract', id: ESCROW_CONTRACT_ID, icon: Lock },
          { label: 'Policy Contract', id: POLICY_CONTRACT_ID, icon: Shield },
        ].map(({ label, id, icon: Icon }) => (
          <div key={id} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="font-mono text-xs text-foreground truncate">{id}</p>
            </div>
            <a href={`https://stellar.expert/explorer/testnet/contract/${id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} className="text-primary hover:opacity-70 transition-opacity" />
            </a>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Deposit Panel */}
        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-primary/10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/20">
                <Lock size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Lock Funds</h2>
                <p className="text-sm text-muted-foreground">Deposit XLM with a time lock</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount (XLM)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.0000001"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    disabled={depositStatus === 'pending'}
                    className="flex-1 bg-transparent text-3xl font-bold outline-none text-foreground placeholder:text-muted-foreground/40 disabled:opacity-50"
                  />
                  <span className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-bold">XLM</span>
                </div>
              </div>

              <div className="p-4 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Clock size={12} />Lock Duration</label>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="number"
                    min="1"
                    placeholder="Duration"
                    value={lockValue}
                    onChange={e => setLockValue(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-secondary rounded-lg text-sm font-bold outline-none focus:ring-2 ring-primary/50 text-foreground placeholder:text-muted-foreground/50"
                  />
                  <select
                    value={lockUnit}
                    onChange={e => setLockUnit(e.target.value)}
                    className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-bold outline-none focus:ring-2 ring-primary/50 text-foreground appearance-none"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  * Minimum lock duration is 1 minute.
                </p>
              </div>
            </div>

            <TxStatusBadge status={depositStatus} hash={depositHash} />

            <button
              onClick={handleDeposit}
              disabled={depositStatus === 'pending' || !publicKey}
              className="w-full py-4 bg-gradient-to-r from-primary to-blue-500 text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-primary/30 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {depositStatus === 'pending' ? <><Loader2 size={20} className="animate-spin" /> Signing...</> : <><Lock size={18} /> Lock Funds in Escrow</>}
            </button>
          </div>
        </div>

        {/* Withdraw Panel */}
        <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-green-500/10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-green-500/20">
                <Unlock size={20} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Unlock Funds</h2>
                <p className="text-sm text-muted-foreground">Withdraw after time lock expires</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={12} /> Error Handling Coverage
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Wallet Not Installed', color: 'text-yellow-500', icon: '⚠️' },
                  { label: 'User Rejected Transaction', color: 'text-red-400', icon: '❌' },
                  { label: 'Time Lock Not Expired', color: 'text-blue-400', icon: '⏳' },
                  { label: 'Unauthorized by Policy', color: 'text-purple-400', icon: '🔐' },
                  { label: 'Insufficient Balance', color: 'text-orange-400', icon: '💸' },
                ].map(e => (
                  <div key={e.label} className="flex items-center gap-2 text-sm">
                    <span>{e.icon}</span>
                    <span className={`${e.color} font-medium`}>{e.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <TxStatusBadge status={withdrawStatus} hash={withdrawHash} />

            <button
              onClick={handleWithdraw}
              disabled={withdrawStatus === 'pending' || !publicKey}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {withdrawStatus === 'pending' ? <><Loader2 size={20} className="animate-spin" /> Signing...</> : <><Unlock size={18} /> Withdraw from Vault</>}
            </button>
          </div>
        </div>
      </div>

      {/* Live Events Feed */}
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Activity size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Live Contract Events</h2>
            <p className="text-sm text-muted-foreground">Real-time Horizon SSE stream for contract activity</p>
          </div>
          <span className="ml-auto flex items-center gap-2 text-xs text-green-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        <AnimatePresence>
          {liveEvents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Zap size={32} className="mx-auto mb-3 opacity-30" />
              <p>Watching for contract events...</p>
              <p className="text-xs mt-1">Transactions will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-background/40 rounded-xl border border-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{event.type}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${event.hash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {event.hash.substring(0, 10)}...<ExternalLink size={10} />
                  </a>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TxStatusBadge({ status, hash }: { status: TxStatus; hash: string }) {
  if (status === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
          status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
          status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}
      >
        {status === 'pending' && <Loader2 size={14} className="animate-spin flex-shrink-0" />}
        {status === 'success' && <CheckCircle2 size={14} className="flex-shrink-0" />}
        {status === 'failed' && <XCircle size={14} className="flex-shrink-0" />}
        <span className="capitalize">
          {status === 'pending' ? 'Transaction Pending — Waiting for blockchain confirmation...' :
           status === 'success' ? 'Transaction Confirmed' : 'Transaction Failed'}
        </span>
        {status === 'success' && hash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
            target="_blank" rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-green-400 hover:text-green-300 shrink-0"
          >
            View <ExternalLink size={10} />
          </a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
