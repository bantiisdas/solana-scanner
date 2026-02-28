import { useCallback, useMemo, useState } from "react";
import { useWalletStore } from "../stores/wallet-store";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

const APP_IDENTITY = {
  name: "SolScan",
  uri: "https://solscan.io",
  icon: "favicon.ico",
};

const decodAddress = (address: string): PublicKey => {
  if (address.includes("=") || address.includes("+") || address.includes("/")) {
    return new PublicKey(Buffer.from(address, "base64"));
  }
  return new PublicKey(address);
};

export function useWallet() {
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const isDevnet = useWalletStore((s) => s.isDevnet);
  const connectedPublicKey = useWalletStore((s) => s.connectedPublicKey);
  const setConnectedPublicKey = useWalletStore((s) => s.setConnectedPublicKey);

  const publicKey = useMemo(() => {
    if (!connectedPublicKey) return null;

    try {
      return new PublicKey(connectedPublicKey);
    } catch (error) {
      return null;
    }
  }, [connectedPublicKey]);

  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  //Connect - Asking wallet to authorize
  const connect = useCallback(async () => {
    setConnecting(true);
    console.log("hookdevnet", isDevnet);

    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        //This Open the wallet & shows the user, authorization dialog

        const result = await wallet.authorize({
          chain: `solana:${cluster}`,
          identity: APP_IDENTITY,
        });
        return result;
      });

      const pubKey = decodAddress(authResult.accounts[0].address);

      setConnectedPublicKey(pubKey.toBase58());
      return pubKey.toBase58();
    } catch (error: any) {
      console.log("Connection failed", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster, isDevnet]);

  //Disconnect
  const disconnect = useCallback(() => {
    setConnectedPublicKey(null);
  }, []);

  //Getting Balance
  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;

    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  //Sending SOL
  const sendSol = useCallback(
    async (toAddress: string, amountSOL: number) => {
      if (!publicKey) throw new Error("Wallet not Connected");

      setSending(true);

      try {
        const toPublicKey = new PublicKey(toAddress);

        //Creating transaction object
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          }),
        );
        //latest block hash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = publicKey;

        //Send the Transaction to Wallet to sign
        const signedTransaction = await transact(
          async (wallet: Web3MobileWallet) => {
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            //sending transaction
            const signedTxs = await wallet.signTransactions({
              transactions: [transaction],
            });

            if (!signedTxs || signedTxs.length === 0) {
              throw new Error("No Signed Transaction returned from wallet");
            }

            return signedTxs[0];
          },
        );

        //delay after wallet closes (network delay)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        //sending transaction with retry logic
        const rawTransaction = signedTransaction.serialize();

        let signature: string | null = null;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            signature = await connection.sendRawTransaction(rawTransaction, {
              maxRetries: 2,
              skipPreflight: true,
            });
            break;
          } catch (error: unknown) {
            lastError = error as Error;
            console.log(`Attempt ${attempt} failed`, lastError.message);
            if (attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (!signature) {
          throw (
            lastError ||
            new Error("Failed to send Transaction after 3 attempts")
          );
        }

        const confirmTransaction = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );

        if (confirmTransaction.value.err) {
          throw new Error(
            `Transaction Failed: ${confirmTransaction.value.err}`,
          );
        }

        return signature;
      } catch (error: any) {
        console.log(error.message);
      } finally {
        setSending(false);
      }
    },
    [publicKey, connection, cluster],
  );

  return {
    connect,
    disconnect,
    publicKey,
    connected: !!publicKey,
    connecting,
    getBalance,
    sendSol,
    sending,
  };
}
