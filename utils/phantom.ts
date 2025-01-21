import * as Linking from "expo-linking";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { decryptPayload } from "./decryptPayload";
import { encryptPayload } from "./encryptPayload";
import { PublicKey, Transaction } from "@solana/web3.js";

/**
 * Constructs a Phantom Deeplink URL for connecting the wallet.
 */
export const buildConnectWalletLink = (
  dappKeyPair: nacl.BoxKeyPair,
  onConnectRedirectLink: string,
  cluster: string = "devnet",
  appUrl?: string
): string => {
  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    cluster,
    redirect_link: onConnectRedirectLink,
  });

  if (appUrl) {
    // e.g. link back to your dApp website
    params.set("app_url", appUrl);
  }

  return `https://phantom.app/ul/v1/connect?${params.toString()}`;
};

/**
 * Opens Phantom to connect the wallet (deeplink).
 */
export const connectPhantomWallet = async (
  dappKeyPair: nacl.BoxKeyPair,
  onConnectRedirectLink: string,
  cluster: string = "devnet",
  appUrl?: string
) => {
  const deeplinkUrl = buildConnectWalletLink(
    dappKeyPair,
    onConnectRedirectLink,
    cluster,
    appUrl
  );

  try {
    await Linking.openURL(deeplinkUrl);
  } catch (error) {
    console.error("Failed to open Phantom Wallet:", error);
    throw error;
  }
};

/**
 * Parses and decrypts the information passed back from Phantom
 * on the connect flow (onConnect redirect).
 */
export const parsePhantomConnectResponse = (
  data: string,
  nonce: string,
  phantomEncryptionPublicKey: string,
  dappSecretKey: Uint8Array
) => {
  // Compute shared secret using ephemeral Phantom public key & dApp's secret key
  const sharedSecret = nacl.box.before(
    bs58.decode(phantomEncryptionPublicKey),
    dappSecretKey
  );

  // Decrypt payload
  const connectData = decryptPayload(data, nonce, sharedSecret);

  /**
   * connectData should look like:
   * {
   *   public_key: string, // base58
   *   session: string
   * }
   */
  return { sharedSecret, connectData };
};

/**
 * Builds the deeplink for signAndSendTransaction request.
 */
export const buildSignAndSendTransactionLink = (
  payload: Record<string, any>, // e.g. { session, transaction }
  dappKeyPair: nacl.BoxKeyPair,
  sharedSecret: Uint8Array,
  onSignAndSendTransactionRedirectLink: string
): string => {
  const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

  const params = new URLSearchParams({
    dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
    nonce: bs58.encode(nonce),
    redirect_link: onSignAndSendTransactionRedirectLink,
    payload: bs58.encode(encryptedPayload),
  });

  return `https://phantom.app/ul/v1/signAndSendTransaction?${params.toString()}`;
};

/**
 * Opens Phantom to sign and send the provided transaction.
 */
export const signAndSendPhantomTransaction = async (
  transaction: Transaction,
  payload: Record<string, any>, // typically { session, transaction: <serialized> }
  dappKeyPair: nacl.BoxKeyPair,
  sharedSecret: Uint8Array,
  onSignAndSendTransactionRedirectLink: string
) => {
  const deeplinkUrl = buildSignAndSendTransactionLink(
    payload,
    dappKeyPair,
    sharedSecret,
    onSignAndSendTransactionRedirectLink
  );

  try {
    await Linking.openURL(deeplinkUrl);
  } catch (error) {
    console.error("Failed to open Phantom Wallet for transaction:", error);
    throw error;
  }
};

/**
 * Decrypts the response from onSignAndSendTransaction
 */
export const parseSignAndSendTransactionResponse = (
  data: string,
  nonce: string,
  sharedSecret: Uint8Array
) => {
  // Example response payload:
  // { signature: '4nGXQrjy...' }
  return decryptPayload(data, nonce, sharedSecret);
};
