import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useWallet } from "@/context/WalletContext";
import {
  PublicKey,
  Connection,
  Keypair,
  clusterApiUrl,
  ConfirmOptions,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  transfer,
} from "@solana/spl-token";
import bs58 from "bs58";

import { DAPP_TREASURY_SECRET_KEY } from "@/env/variables";
import { getKeypairFromBase58 } from "@/utils/decryptPayload";

export default function AirdropScreen() {
  const { walletAddress } = useWallet(); // Use wallet address from context
  const [amount, setAmount] = useState("");

  // --- 1) SETUP SOLANA CONNECTION & TREASURY ---
  const connection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  // Replace with your DRB mint address
  const DRB_MINT_PUBLIC_KEY = new PublicKey(
    "Ft9GcnXDQ6CkPGFwSEMXp3euUNThKaj9R6eYhu8XmmPE"
  );

  // Decode the treasury secret key and create a Keypair
  const treasuryKeypair: Keypair = getKeypairFromBase58(
    DAPP_TREASURY_SECRET_KEY
  );

  // --- 2) MAIN AIRDROP FUNCTION ---
  const handleAirdrop = async () => {
    try {
      console.log("Starting Airdrop Process...");

      // Validate wallet connection
      if (!walletAddress) {
        Alert.alert("Error", "No wallet connected.");
        console.error("No wallet connected.");
        return;
      }
      console.log("Connected wallet address:", walletAddress);

      // Validate the amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert("Error", "Please enter a valid positive number.");
        console.error("Invalid amount entered:", amount);
        return;
      }
      if (parsedAmount > 10) {
        Alert.alert("Error", "Airdrop amount cannot exceed 10 DRB.");
        console.error("Airdrop amount exceeds the limit:", parsedAmount);
        return;
      }
      console.log("Airdrop amount validated:", parsedAmount);

      // Set recipient as the connected wallet
      const recipientPublicKey = new PublicKey(walletAddress);
      console.log("Recipient public key:", recipientPublicKey.toBase58());
      const confirmOptions: ConfirmOptions = {
        skipPreflight: false,
        maxRetries: 5,
      };

      // --- 2a) Ensure the TREASURY token account exists ---
      console.log("Ensuring treasury token account exists...");
      const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryKeypair, // Payer for creation
        DRB_MINT_PUBLIC_KEY, // Token mint
        treasuryKeypair.publicKey, // Treasury wallet
        false, // allowOwnerOffCurve
        "confirmed", // Commitment
        confirmOptions, // ConfirmOptions
        TOKEN_2022_PROGRAM_ID, // Custom Token Program
        ASSOCIATED_TOKEN_PROGRAM_ID // Associated Token Program
      );
      console.log(
        "Treasury token account:",
        treasuryTokenAccount.address.toBase58()
      );

      // Log treasury token account balance
      const treasuryBalance = await connection.getTokenAccountBalance(
        treasuryTokenAccount.address
      );
      console.log("Treasury token balance:", treasuryBalance.value.uiAmount);

      // --- 2b) Ensure the RECIPIENT token account exists ---
      console.log("Ensuring recipient token account exists...");
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryKeypair, // Payer for creation
        DRB_MINT_PUBLIC_KEY, // Token mint
        recipientPublicKey,
        false, // allowOwnerOffCurve
        "confirmed", // Commitment
        confirmOptions, // ConfirmOptions
        TOKEN_2022_PROGRAM_ID, // Custom Token Program
        ASSOCIATED_TOKEN_PROGRAM_ID // Associated Token Program
      );
      console.log(
        "Recipient token account:",
        recipientTokenAccount.address.toBase58()
      );

      // Log recipient token account balance
      const recipientBalance = await connection.getTokenAccountBalance(
        recipientTokenAccount.address
      );
      console.log("Recipient token balance:", recipientBalance.value.uiAmount);

      // --- 2c) Transfer tokens from treasury -> recipient ---
      console.log("Initiating token transfer...");
      const txSignature = await transfer(
        connection,
        treasuryKeypair, // Payer + owner of source account
        treasuryTokenAccount.address, // Source token account
        recipientTokenAccount.address, // Destination token account
        treasuryKeypair, // Owner of the source token account
        parsedAmount,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      console.log(`Successfully transferred ${parsedAmount} DRB tokens.`);
      console.log("Transaction signature:", txSignature);

      Alert.alert(
        "Success",
        `Airdropped ${parsedAmount} DRB tokens to your wallet.\n\nTransaction Signature:\n${txSignature}`
      );
    } catch (error) {
      console.error("Airdrop Error:", error);
      Alert.alert("Error", "Failed to complete the airdrop. Please try again.");
    }
  };

  // --- 3) RENDER ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Airdrop DRB Tokens</Text>
      <Text style={styles.label}>Amount to Airdrop (Max: 10 DRB):</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
      />
      <Button title="Airdrop" onPress={handleAirdrop} color="#1E90FF" />
    </View>
  );
}

// --- 4) STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
});
