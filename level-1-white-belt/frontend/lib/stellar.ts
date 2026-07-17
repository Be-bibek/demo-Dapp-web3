import * as StellarSdk from '@stellar/stellar-sdk';

export const horizonServer = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
export const networkPassphrase = StellarSdk.Networks.TESTNET;

export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const balance = account.balances.find((b) => b.asset_type === 'native');
    return balance ? balance.balance : '0';
  } catch (error) {
    console.error("Error fetching balance:", error);
    return '0';
  }
}

export async function sendXLM(senderPublicKey: string, receiverPublicKey: string, amount: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(senderPublicKey);
    
    // Create the payment operation
    const operation = StellarSdk.Operation.payment({
      destination: receiverPublicKey,
      asset: StellarSdk.Asset.native(),
      amount: amount,
    });

    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Convert transaction to XDR string
    const xdr = transaction.toXDR();

    // Sign the transaction using Stellar Wallets Kit
    const { kit } = await import('@/store/walletStore');
    const signedTx = await kit.signTransaction(xdr, {
      networkPassphrase
    });
    
    // Stellar Wallets Kit returns an object with `signedXDR` or `signedTxXdr` or just returns the string depending on version. Let's handle string or object.
    let finalXdr: string = signedTx as any;
    if (typeof signedTx === 'object' && signedTx !== null) {
      if ('signedXDR' in signedTx) finalXdr = (signedTx as any).signedXDR;
      else if ('signedTxXdr' in signedTx) finalXdr = (signedTx as any).signedTxXdr;
    }

    // Submit the signed transaction to Horizon
    const reconstructedTx = StellarSdk.TransactionBuilder.fromXDR(finalXdr, networkPassphrase);
    const response = await horizonServer.submitTransaction(reconstructedTx as StellarSdk.Transaction);
    
    if (response.successful) {
      return response.hash;
    } else {
      throw new Error("Transaction failed on the network");
    }
  } catch (error: any) {
    console.error("Error sending XLM:", error);
    throw new Error(error.message || "Failed to send XLM");
  }
}

export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    if (response.ok) {
      return true;
    }
    const data = await response.json();
    throw new Error(data.detail || "Failed to fund via Friendbot");
  } catch (error: any) {
    console.error("Friendbot error:", error);
    throw new Error(error.message || "Friendbot request failed");
  }
}

export interface TransactionRecord {
  id: string;
  hash: string;
  created_at: string;
  successful: boolean;
  action: string;
  amount?: string;
}

export async function fetchTransactions(publicKey: string): Promise<TransactionRecord[]> {
  try {
    const response = await horizonServer.operations()
      .forAccount(publicKey)
      .order('desc')
      .limit(10)
      .call();

    return response.records.map((record: any) => {
      let action = record.type.replace(/_/g, ' ');
      action = action.charAt(0).toUpperCase() + action.slice(1);
      
      let amount: string | undefined = undefined;
      
      if (record.type === 'payment') {
        amount = record.amount;
        action = record.to === publicKey ? 'Received Payment' : 'Sent Payment';
      } else if (record.type === 'create_account') {
        amount = record.starting_balance;
        action = record.account === publicKey ? 'Account Funded' : 'Created Account';
      } else if (record.type === 'invoke_host_function') {
        action = 'Smart Contract Call';
      }

      return {
        id: record.id,
        hash: record.transaction_hash,
        created_at: record.created_at,
        successful: record.transaction_successful,
        action,
        amount,
      };
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}
