import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
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

  // Setup Solana connection and treasury
  const connection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  const DRB_MINT_PUBLIC_KEY = new PublicKey(
    "Ft9GcnXDQ6CkPGFwSEMXp3euUNThKaj9R6eYhu8XmmPE"
  );

  const treasuryKeypair: Keypair = getKeypairFromBase58(
    DAPP_TREASURY_SECRET_KEY
  );

  const handleAirdrop = async () => {
    try {
      if (!walletAddress) {
        Alert.alert("Error", "No wallet connected.");
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert("Error", "Please enter a valid positive number.");
        return;
      }
      if (parsedAmount > 10) {
        Alert.alert("Error", "Airdrop amount cannot exceed 10 DRB.");
        return;
      }

      const recipientPublicKey = new PublicKey(walletAddress);
      const confirmOptions: ConfirmOptions = {
        skipPreflight: false,
        maxRetries: 5,
      };

      const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryKeypair,
        DRB_MINT_PUBLIC_KEY,
        treasuryKeypair.publicKey,
        false,
        "confirmed",
        confirmOptions,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryKeypair,
        DRB_MINT_PUBLIC_KEY,
        recipientPublicKey,
        false,
        "confirmed",
        confirmOptions,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const txSignature = await transfer(
        connection,
        treasuryKeypair,
        treasuryTokenAccount.address,
        recipientTokenAccount.address,
        treasuryKeypair,
        parsedAmount,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      Alert.alert(
        "Success",
        `Airdropped ${parsedAmount} DRB tokens to your wallet.\n\nTransaction Signature:\n${txSignature}`
      );
    } catch (error) {
      console.error("Airdrop Error:", error);
      Alert.alert("Error", "Failed to complete the airdrop. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Airdrop Drobe</Text>
      <Text style={styles.label}>Amount to Airdrop (Max: 10 DRB):</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        placeholderTextColor="#bbb"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleAirdrop}>
        <Text style={styles.buttonText}>Airdrop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E5E5E5",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#C7C7C7",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
