import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import CircularButton from "@/components/CircularButton";
import { useRouter } from "expo-router";
import { usePhoto } from "@/context/PhotoContext";
import { useAnalysis } from "@/context/AnalysisContext";
import { analyzePhoto } from "@/services/aiService";
import { useWallet } from "@/context/WalletContext";
import {
  PublicKey,
  Connection,
  Keypair,
  clusterApiUrl,
  ConfirmOptions,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { DAPP_TREASURY_SECRET_KEY } from "@/env/variables";
import { getKeypairFromBase58 } from "@/utils/decryptPayload";

export default function PhotoPreviewScreen() {
  const { photo, clearPhoto } = usePhoto();
  const { setAnalysisResult } = useAnalysis();
  const { signAndSendTransaction, walletAddress } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const connection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  const DRB_MINT_PUBLIC_KEY = new PublicKey(
    "Ft9GcnXDQ6CkPGFwSEMXp3euUNThKaj9R6eYhu8XmmPE"
  );

  const treasuryKeypair: Keypair = getKeypairFromBase58(
    DAPP_TREASURY_SECRET_KEY
  );

  const handleCancel = () => {
    clearPhoto();
    router.replace("/");
  };

  const transferTokenForAnalysis = async () => {
    if (!walletAddress) {
      Alert.alert("Error", "No wallet connected.");
      throw new Error("No wallet connected.");
    }

    const userPublicKey = new PublicKey(walletAddress);
    const treasuryPublicKey = treasuryKeypair.publicKey;
    const confirmOptions: ConfirmOptions = {
      skipPreflight: false,
      maxRetries: 5,
    };

    // Ensure the treasury token account exists
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair, // Payer
      DRB_MINT_PUBLIC_KEY, // Token mint
      treasuryPublicKey,
      false, // allowOwnerOffCurve
      "confirmed",
      confirmOptions,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Ensure the user token account exists
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair, // Payer
      DRB_MINT_PUBLIC_KEY, // Token mint
      userPublicKey,
      false, // allowOwnerOffCurve
      "confirmed",
      confirmOptions,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create the transaction for token transfer
    const transaction = new Transaction().add(
      new TransactionInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        keys: [
          {
            pubkey: userTokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: treasuryTokenAccount.address,
            isSigner: false,
            isWritable: true,
          },
          { pubkey: userPublicKey, isSigner: true, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(1)), // Transfer 1 DRB
      })
    );

    try {
      // Sign and send transaction using Phantom Wallet
      await signAndSendTransaction(transaction);
      console.log("Token transfer successful.");
    } catch (error) {
      console.error("Token Transfer Error:", error);
      Alert.alert("Error", "Failed to transfer DRB token.");
      throw error;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Transfer token before proceeding with analysis
      await transferTokenForAnalysis();

      // Analyze the photo
      const result = await analyzePhoto(photo!);
      console.log("AI Analysis Result:", result);

      // Set result in context and navigate to the analysis page
      setAnalysisResult(result);
      setLoading(false);
      router.push("/analysis");
    } catch (error) {
      console.error("Error during submission:", error);
      Alert.alert("Error", "Failed to complete the process. Please try again.");
      setLoading(false);
    }
  };

  if (!photo) {
    router.replace("/");
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photo }} style={styles.photoPreview} />
      <View style={styles.buttonContainer}>
        <CircularButton
          icon="close-outline"
          onPress={handleCancel}
          backgroundColor="#6c757d"
        />
        <CircularButton
          icon="checkmark-outline"
          onPress={handleSubmit}
          backgroundColor="#007bff"
          size={36}
        />
      </View>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  photoPreview: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingVertical: 15,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
