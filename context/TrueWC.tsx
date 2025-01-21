/*
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as Linking from "expo-linking";
import {
  Connection,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { decryptPayload } from "@/utils/decryptPayload";
import { encryptPayload } from "@/utils/encryptPayload";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const onConnectRedirectLink = Linking.createURL("onConnect");
const onSignAndSendTransactionRedirectLink = Linking.createURL(
  "onSignAndSendTransaction"
);

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  signAndSendTransaction: (
    transaction: Transaction,
    metadata?: string
  ) => Promise<void>;
  transferTokensToTreasury: (
    treasuryPublicKey: string,
    tokenMintAddress: string,
    amount: number
  ) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] =
    useState<PublicKey | null>(null);
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();
  const [deepLink, setDeepLink] = useState<string>("");

  const [dappKeyPair] = useState(nacl.box.keyPair());

  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();

    const listener = Linking.addEventListener("url", handleDeepLink);
    return () => {
      listener.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: Linking.EventType) => {
    setDeepLink(url);
  };

  useEffect(() => {
    if (!deepLink) return;

    const url = new URL(deepLink);
    const params = url.searchParams;

    if (params.get("errorCode")) {
      console.error("Error:", params.get("errorMessage") || "Unknown error");
      return;
    }

    if (/onConnect/.test(url.pathname)) {
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(params.get("phantom_encryption_public_key")!),
        dappKeyPair.secretKey
      );
      const connectData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecretDapp
      );
      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
      console.log(`Connected to wallet: ${connectData.public_key}`);
    }

    if (/onSignAndSendTransaction/.test(url.pathname)) {
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret!
      );
      console.log("Transaction submitted:", signAndSendTransactionData);
      alert(
        `Success! Transaction Signature: ${signAndSendTransactionData.signature}`
      );
    }
  }, [deepLink]);

  const connectWallet = async (): Promise<void> => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "devnet",
      app_url: "https://agneus.github.io/drobe-page/",
      redirect_link: onConnectRedirectLink,
    });

    const deeplinkUrl = `https://phantom.app/ul/v1/connect?${params.toString()}`;
    try {
      await Linking.openURL(deeplinkUrl);
    } catch (error) {
      console.error("Failed to open Phantom Wallet:", error);
    }
  };

  const signAndSendTransaction = async (
    transaction: Transaction,
    metadata?: string
  ): Promise<void> => {
    if (!phantomWalletPublicKey || !sharedSecret) {
      throw new Error("Wallet not connected");
    }

    transaction.feePayer = phantomWalletPublicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Add metadata to the transaction using Memo Program
    if (metadata) {
      console.log("Metadata before encoding (stringified):", metadata);

      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(metadata, "utf8"), // Explicitly encoding metadata as UTF-8
      });
      transaction.add(memoInstruction);

      console.log(
        "Base64-encoded metadata (for blockchain):",
        Buffer.from(metadata, "utf8").toString("base64")
      );
    }

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    const deeplinkUrl = `https://phantom.app/ul/v1/signAndSendTransaction?${params.toString()}`;
    try {
      await Linking.openURL(deeplinkUrl);
    } catch (error) {
      console.error("Failed to open Phantom Wallet for transaction:", error);
      throw error;
    }
  };

  const transferTokensToTreasury = async (
    treasuryPublicKey: string, // Treasury's wallet address
    tokenMintAddress: string, // Token mint address
    amount: number // Amount to transfer (raw units)
  ): Promise<void> => {
    if (!phantomWalletPublicKey || !sharedSecret) {
      throw new Error("Wallet not connected");
    }

    const mintPublicKey = new PublicKey(tokenMintAddress);
    const senderPublicKey = phantomWalletPublicKey;
    const treasuryPublicKeyParsed = new PublicKey(treasuryPublicKey);

    // Ensure sender's token account exists
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Temporary payer for account creation (replace as needed)
      mintPublicKey,
      senderPublicKey,
      false, // allowOwnerOffCurve
      "confirmed", // Commitment
      undefined, // ConfirmOptions
      TOKEN_2022_PROGRAM_ID // Explicitly using Token 2022 Program
    );

    // Ensure treasury's token account exists
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Temporary payer for account creation (replace as needed)
      mintPublicKey,
      treasuryPublicKeyParsed,
      false, // allowOwnerOffCurve
      "confirmed", // Commitment
      undefined, // ConfirmOptions
      TOKEN_2022_PROGRAM_ID // Explicitly using Token 2022 Program
    );

    console.log("Sender Token Account:", senderTokenAccount.address.toBase58());
    console.log(
      "Treasury Token Account:",
      treasuryTokenAccount.address.toBase58()
    );

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount.address, // Source token account
      treasuryTokenAccount.address, // Destination token account
      senderPublicKey, // Owner of the source account
      amount, // Amount to transfer (raw units)
      [], // MultiSigners (not used here)
      TOKEN_2022_PROGRAM_ID // Explicitly using Token 2022 Program
    );

    // Create the transaction
    const transaction = new Transaction().add(transferInstruction);

    // Use the existing `signAndSendTransaction` to open Phantom Wallet
    await signAndSendTransaction(transaction, "Transfer tokens to Treasury");
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress: phantomWalletPublicKey?.toString() || null,
        connectWallet,
        signAndSendTransaction,
        transferTokensToTreasury,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};


*/
