import { useCallback, useState } from "react";
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

export function useWallet() {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  //Asking wallet to authorize
  const connect = useCallback(async () => {
    setConnecting(true);

    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        //This Open the wallet & shows the user, authorization dialog

        const result = await wallet.authorize({
          chain: cluster,
          identity: APP_IDENTITY,
        });
        return result;
      });

      const pubKey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, "base64"),
      );
      setPublicKey(pubKey);
      return pubKey;
    } catch (error: any) {
      console.log("Connection failed", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  //Disconnect
  const disconnect = useCallback(() => {
    setPublicKey(null);
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
        const txSignature = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({ chain: cluster, identity: APP_IDENTITY });

          //sending transaction
          const signatures = await wallet.signTransactions({
            transactions: [transaction],
          });

          return signatures[0];
        });

        return txSignature;
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
  };
}
