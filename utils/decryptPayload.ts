import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Decrypts a payload using the provided shared secret.
 * @param data - The encrypted data in base58 format.
 * @param nonce - The nonce used for encryption in base58 format.
 * @param sharedSecret - The shared secret used for decryption.
 * @returns The decrypted payload as a JSON object.
 * @throws If decryption fails or the payload cannot be parsed.
 */
export const decryptPayload = (
  data: string,
  nonce: string,
  sharedSecret: Uint8Array
): any => {
  if (!sharedSecret) {
    throw new Error("Missing shared secret for decryption");
  }

  // Decode the encrypted data and nonce from base58
  const decodedData = bs58.decode(data);
  const decodedNonce = bs58.decode(nonce);

  // Decrypt the data
  const decryptedData = nacl.box.open.after(
    decodedData,
    decodedNonce,
    sharedSecret
  );

  if (!decryptedData) {
    throw new Error("Failed to decrypt payload");
  }

  // Convert the decrypted data from Uint8Array to a string and parse it as JSON
  const decryptedText = new TextDecoder().decode(decryptedData);

  try {
    return JSON.parse(decryptedText);
  } catch (error) {
    throw new Error("Failed to parse decrypted payload as JSON");
  }
};
