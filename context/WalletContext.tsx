import "react-native-get-random-values";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

if (global.Buffer == null) {
  global.Buffer = Buffer;
}

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const [session, setSession] = useState<string>();
  const [deepLink, setDeepLink] = useState<string>("");

  const onConnectRedirectLink = Linking.createURL("onConnect");

  // Initialize deeplinks and listener
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

  // Handle inbound deeplinks
  useEffect(() => {
    if (!deepLink) return;

    const url = new URL(deepLink);
    const params = url.searchParams;

    // Handle errors
    if (params.get("errorCode")) {
      console.error(
        "Error during Phantom Wallet connection:",
        params.get("errorMessage") || "Unknown error"
      );
      return;
    }

    // Handle `connect` response
    if (/onConnect/.test(url.pathname)) {
      const phantomEncryptionPublicKey = params.get(
        "phantom_encryption_public_key"
      );
      const data = params.get("data");
      const nonce = params.get("nonce");

      if (!phantomEncryptionPublicKey || !data || !nonce) {
        console.error("Missing required parameters in deeplink");
        return;
      }

      // Compute the shared secret
      const sharedSecretDapp = nacl.box.before(
        bs58.decode(phantomEncryptionPublicKey),
        dappKeyPair.secretKey
      );

      // Decrypt the payload
      const decryptedData = nacl.box.open.after(
        bs58.decode(data),
        bs58.decode(nonce),
        sharedSecretDapp
      );

      if (!decryptedData) {
        console.error("Failed to decrypt data");
        return;
      }

      const connectData = JSON.parse(
        Buffer.from(decryptedData).toString("utf8")
      );
      setSharedSecret(sharedSecretDapp);
      setSession(connectData.session);
      setWalletAddress(connectData.public_key);
      console.log(`Connected to wallet: ${connectData.public_key}`);
    }
  }, [deepLink]);

  // Connect wallet via Phantom
  const connectWallet = async (): Promise<void> => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "devnet",
      app_url: "https://mnemonic-master.vercel.app/",
      redirect_link: onConnectRedirectLink,
    });

    const deeplinkUrl = `https://phantom.app/ul/v1/connect?${params.toString()}`;
    try {
      await Linking.openURL(deeplinkUrl);
    } catch (error) {
      console.error("Failed to open Phantom Wallet:", error);
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet }}>
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
