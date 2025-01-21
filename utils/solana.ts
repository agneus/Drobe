import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
  Keypair,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

/**
 * Attaches a memo instruction with UTF-8 data to the transaction.
 */
export const addMemoToTransaction = (tx: Transaction, memo: string) => {
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf8"),
  });
  tx.add(memoInstruction);
};

/**
 * Airdrop "Drobe" (DRB) tokens to a given wallet.
 *
 * @param connection Solana connection object
 * @param mintPublicKey The PublicKey for your DRB token mint
 * @param authority The Keypair that holds the mint authority for DRB
 * @param recipientPublicKey The public key of the wallet you want to airdrop tokens to
 * @param amount The number of tokens you want to mint (raw, not accounting for decimals)
 *
 * @returns The signature of the confirmed transaction
 */
export async function airdropDrobeTokens(
  connection: Connection,
  mintPublicKey: PublicKey,
  authority: Keypair,
  recipientPublicKey: PublicKey,
  amount: number
): Promise<string> {
  // 1. Get or create the recipient's associated token account for the DRB mint
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    authority, // Payer for transaction & rent
    mintPublicKey,
    recipientPublicKey
  );

  // 2. Mint new tokens to the recipient's token account
  // If your DRB mint has decimals, you may need to adjust `amount` accordingly
  const signature = await mintTo(
    connection,
    authority, // Payer of the transaction
    mintPublicKey, // The DRB mint address
    recipientTokenAccount.address, // The recipient's associated token account
    authority, // The mint authority
    amount, // Raw amount of tokens
    [] // Any additional signers
  );

  console.log(
    `Minted ${amount} DRB tokens to ${recipientPublicKey.toBase58()}`
  );
  console.log("Transaction signature:", signature);

  return signature;
}

/**
 * Transfer DRB tokens from a treasury (or any) SPL token account to a recipient.
 *
 * @param connection           The Solana connection object
 * @param treasuryKeypair      The Keypair that pays for this transaction,
 *                             and must be the owner of the treasuryFromTokenAccount
 * @param drbMintPublicKey     The public key of your DRB token mint
 * @param treasuryFromTokenAccount  The treasury's (or sender's) DRB token account
 * @param recipientPublicKey   The wallet address that should receive tokens
 * @param amount               Raw token amount to transfer (depends on your decimals)
 *
 * @returns The transaction signature
 */
export async function transferDrobeTokens(
  connection: Connection,
  treasuryKeypair: Keypair,
  drbMintPublicKey: PublicKey,
  treasuryFromTokenAccount: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number
): Promise<string> {
  // Step 1: Ensure recipient has an associated token account
  // Note: This will create the account if it does not exist.
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    treasuryKeypair, // payer for the creation (and transaction)
    drbMintPublicKey,
    recipientPublicKey
  );

  // Step 2: Transfer tokens
  const txSignature = await transfer(
    connection,
    treasuryKeypair, // payer of transaction, also the 'owner' of fromTokenAccount
    treasuryFromTokenAccount, // source token account (sender)
    recipientTokenAccount.address, // destination token account (recipient)
    treasuryKeypair, // owner of treasuryFromTokenAccount
    amount
  );

  console.log(
    `Transferred ${amount} DRB tokens to ${recipientPublicKey.toBase58()}`
  );
  console.log("Transaction signature:", txSignature);

  return txSignature;
}
