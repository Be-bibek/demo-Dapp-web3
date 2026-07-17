import * as StellarSdk from '@stellar/stellar-sdk';

// ==========================================
// Contract addresses (Stellar Testnet)
// ==========================================
export const POLICY_CONTRACT_ID = 'CAKXYDS7OM2GH2JY5QUHA6EA4NGT6CPLTHGVHNGMEEIHLZAPSAYLD3M5';
export const ESCROW_CONTRACT_ID = 'CAISSVEWZWEGK66CWHUVV2YQHLSUXBHDZVGDIZ57BVXAP2D4T6QZAGKN';

const sorobanRpc = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// ==========================================
// Custom error codes
// ==========================================
export class WalletNotInstalledError extends Error {
  constructor() { super('No Stellar wallet detected. Please install Freighter and try again.'); this.name = 'WalletNotInstalledError'; }
}
export class UserRejectedError extends Error {
  constructor() { super('Transaction was rejected by the user.'); this.name = 'UserRejectedError'; }
}
export class TimeLockError extends Error {
  constructor() { super('Your funds are still time-locked. Please wait until the unlock time has passed.'); this.name = 'TimeLockError'; }
}
export class UnauthorizedPolicyError extends Error {
  constructor() { super('Your account has not been authorized by the Policy contract. Contact the contract admin.'); this.name = 'UnauthorizedPolicyError'; }
}
export class InsufficientBalanceError extends Error {
  constructor() { super('Insufficient XLM balance to cover this transaction.'); this.name = 'InsufficientBalanceError'; }
}
export class NetworkError extends Error {
  constructor(msg: string) { super(`Network error: ${msg}`); this.name = 'NetworkError'; }
}

function mapSorobanError(error: any): Error {
  const msg = String(error?.message || error);
  if (msg.includes('user closed') || msg.includes('rejected') || msg.includes('code: -1')) return new UserRejectedError();
  if (msg.includes('TimeLockNotExpired')) return new TimeLockError();
  if (msg.includes('UnauthorizedPolicy')) return new UnauthorizedPolicyError();
  if (msg.includes('insufficient') || msg.includes('tx_insufficient_balance')) return new InsufficientBalanceError();
  if (msg.includes('network') || msg.includes('fetch')) return new NetworkError(msg);
  
  // Catch raw VM traps from Soroban standard panics
  if (msg.includes('Error(WasmVm, InvalidAction)') || msg.includes('UnreachableCodeReached')) {
    return new Error('Smart Contract Error: Transaction reverted. Ensure the Time Lock has expired and you are Authorized.');
  }

  return error instanceof Error ? error : new Error(msg);
}

// ==========================================
// Build and simulate/send a Soroban tx
// ==========================================
async function buildAndSend(
  senderPublicKey: string,
  operation: StellarSdk.xdr.Operation
): Promise<string> {
  // Load source account
  const sourceAccount = await sorobanRpc.getAccount(senderPublicKey);

  // Build transaction
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Simulate to get footprint + fee
  const sim = await sorobanRpc.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();

  // Sign via Wallets Kit
  const { kit } = await import('@/store/walletStore');
  const signedResult = await kit.signTransaction(preparedTx.toXDR(), { networkPassphrase });

  let finalXdr: string = signedResult as any;
  if (typeof signedResult === 'object' && signedResult !== null) {
    if ('signedXDR' in signedResult) finalXdr = (signedResult as any).signedXDR;
    else if ('signedTxXdr' in signedResult) finalXdr = (signedResult as any).signedTxXdr;
  }

  // Submit
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(finalXdr, networkPassphrase);
  const response = await sorobanRpc.sendTransaction(signedTx as StellarSdk.Transaction);

  if (response.status === 'ERROR') {
    throw new Error(response.errorResult?.result().toString() || 'Transaction failed');
  }

  // Poll for confirmation
  const hash = response.hash;
  let pollResult = await sorobanRpc.getTransaction(hash);
  for (let i = 0; i < 20; i++) {
    if (pollResult.status !== StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) break;
    await new Promise(r => setTimeout(r, 1500));
    pollResult = await sorobanRpc.getTransaction(hash);
  }

  if (pollResult.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
    const resultMeta = (pollResult as any).resultMetaXdr;
    const msg = resultMeta?.toString() || 'Contract execution failed';
    throw new Error(msg);
  }

  return hash;
}

// ==========================================
// Escrow: Deposit
// ==========================================
export async function escrowDeposit(
  senderPublicKey: string,
  tokenContractId: string,
  amountXlm: string,
  unlockTimeSeconds: number,
): Promise<string> {
  try {
    // Amount in stroops (1 XLM = 10,000,000 stroops)
    const amountStroops = BigInt(Math.round(parseFloat(amountXlm) * 10_000_000));
    const unlockTimestamp = BigInt(Math.floor(Date.now() / 1000) + unlockTimeSeconds);

    const operation = StellarSdk.Operation.invokeContractFunction({
      contract: ESCROW_CONTRACT_ID,
      function: 'deposit',
      args: [
        StellarSdk.nativeToScVal(senderPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(tokenContractId, { type: 'address' }),
        StellarSdk.nativeToScVal(amountStroops, { type: 'i128' }),
        StellarSdk.nativeToScVal(unlockTimestamp, { type: 'u64' }),
      ],
    });

    return await buildAndSend(senderPublicKey, operation);
  } catch (error) {
    throw mapSorobanError(error);
  }
}

// ==========================================
// Escrow: Withdraw
// ==========================================
export async function escrowWithdraw(
  senderPublicKey: string,
  tokenContractId: string,
): Promise<string> {
  try {
    const operation = StellarSdk.Operation.invokeContractFunction({
      contract: ESCROW_CONTRACT_ID,
      function: 'withdraw',
      args: [
        StellarSdk.nativeToScVal(senderPublicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(tokenContractId, { type: 'address' }),
      ],
    });

    return await buildAndSend(senderPublicKey, operation);
  } catch (error) {
    throw mapSorobanError(error);
  }
}

// ==========================================
// Policy: Authorize (Admin Override)
// ==========================================
export async function policyAuthorize(
  adminPublicKey: string,
  userToAuthorize: string,
): Promise<string> {
  try {
    const operation = StellarSdk.Operation.invokeContractFunction({
      contract: POLICY_CONTRACT_ID,
      function: 'authorize',
      args: [
        StellarSdk.nativeToScVal(userToAuthorize, { type: 'address' }),
      ],
    });

    return await buildAndSend(adminPublicKey, operation);
  } catch (error) {
    throw mapSorobanError(error);
  }
}

// ==========================================
// Polling: Subscribe to escrow contract events
// ==========================================
export function subscribeToEscrowEvents(
  onEvent: (event: { type: string; amount?: string; user?: string; hash: string }) => void
): () => void {
  let isSubscribed = true;
  const seenHashes = new Set<string>();

  const poll = async () => {
    if (!isSubscribed) return;
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${ESCROW_CONTRACT_ID}/transactions?order=desc&limit=5`);
      const data = await response.json();
      
      if (data && data._embedded && data._embedded.records) {
        // Process in reverse to get oldest first among the latest 5
        const records = [...data._embedded.records].reverse();
        
        records.forEach((record: any) => {
          if (!seenHashes.has(record.hash)) {
            seenHashes.add(record.hash);
            onEvent({
              type: 'Smart Contract Call',
              hash: record.hash,
            });
          }
        });
      }
    } catch (e) {
      console.error("Polling error:", e);
    }

    if (isSubscribed) {
      setTimeout(poll, 3000);
    }
  };

  // Start polling
  poll();

  return () => {
    isSubscribed = false;
  };
}
