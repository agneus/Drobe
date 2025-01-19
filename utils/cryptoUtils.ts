import "react-native-get-random-values";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { Buffer } from "buffer";

if (global.Buffer == null) {
  global.Buffer = Buffer;
}

export const encodePublicKeyToBase58 = (publicKey: Uint8Array): string => {
  return bs58.encode(publicKey);
};

export const generateKeyPair = () => nacl.box.keyPair();

export const decryptPayload = (
  data: string,
  nonce: string,
  sharedSecret: Uint8Array
): any => {
  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );

  if (!decryptedData) {
    throw new Error("Failed to decrypt data");
  }

  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};

export const computeSharedSecret = (
  phantomEncryptionPublicKey: string,
  secretKey: Uint8Array
): Uint8Array => {
  return nacl.box.before(bs58.decode(phantomEncryptionPublicKey), secretKey);
};
