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
} from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { decryptPayload } from "@/utils/decryptPayload";
import { encryptPayload } from "@/utils/encryptPayload";

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

  return (
    <WalletContext.Provider
      value={{
        walletAddress: phantomWalletPublicKey?.toString() || null,
        connectWallet,
        signAndSendTransaction,
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
