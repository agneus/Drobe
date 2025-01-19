import "react-native-get-random-values";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Encrypts a payload using the provided shared secret.
 * @param payload - The data to encrypt.
 * @param sharedSecret - The shared secret used for encryption.
 * @returns A tuple containing the nonce and the encrypted payload, both encoded as base58 strings.
 */
export const encryptPayload = (
  payload: Record<string, any>,
  sharedSecret: Uint8Array
): [Uint8Array, Uint8Array] => {
  if (!sharedSecret) {
    throw new Error("Missing shared secret for encryption");
  }

  // Convert the payload to a JSON string and then to a Buffer
  const payloadBuffer = Buffer.from(JSON.stringify(payload));

  // Generate a random nonce
  const nonce = nacl.randomBytes(24);

  // Encrypt the payload using the shared secret and nonce
  const encryptedPayload = nacl.box.after(payloadBuffer, nonce, sharedSecret);

  return [nonce, encryptedPayload];
};
