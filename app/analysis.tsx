import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAnalysis } from "@/context/AnalysisContext";
import { usePhoto } from "@/context/PhotoContext";
import { useWallet } from "@/context/WalletContext";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";

export default function AnalysisScreen() {
  const { analysisResult, clearAnalysisResult } = useAnalysis();
  const { photo } = usePhoto();
  const { walletAddress, signAndSendTransaction } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!analysisResult) {
      const timeout = setTimeout(() => {
        router.replace("/");
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [analysisResult]);

  if (!analysisResult) {
    return null; // Render nothing if no result
  }

  const { gender, fitRating, colorAnalysis, styleRecommendations } =
    analysisResult;

  const handleSave = async () => {
    if (!walletAddress) {
      Alert.alert("Error", "Please connect your wallet first.");
      return;
    }

    try {
      // Serialize the analysis result into a string
      const analysisData = JSON.stringify({
        gender,
        fitRating,
        colorAnalysis,
        styleRecommendations,
      });

      console.log("Analysis Data to Save:", analysisData);

      // Create a Solana transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(walletAddress), // Replace with a recipient if needed
          lamports: 1000, // Small fee to trigger the transaction
        })
      );

      // Use signAndSendTransaction to save the data
      await signAndSendTransaction(
        transaction,
        JSON.stringify({
          gender: analysisResult.gender,
          fitRating: analysisResult.fitRating,
        })
      );

      Alert.alert("Success", "Analysis data saved to blockchain!");
    } catch (error) {
      console.error("Error saving to blockchain:", error);
      Alert.alert(
        "Error",
        "Failed to save data to blockchain. Please try again."
      );
    }
  };

  const handleBackToHome = () => {
    clearAnalysisResult(); // Clear the analysis result
    router.replace("/"); // Navigate back to Home
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analysis Results</Text>

      {/* Display Photo */}
      {photo && (
        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>Photo:</Text>
          <View style={styles.photo}>
            {/* The photo can be displayed here */}
          </View>
        </View>
      )}

      {/* Display Analysis Results */}
      <View style={styles.resultBox}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>Biological {gender}</Text>
      </View>
      <View style={styles.resultBox}>
        <Text style={styles.label}>Fit Rating:</Text>
        <Text style={styles.value}>{fitRating}/10</Text>
      </View>
      <View style={styles.resultBox}>
        <Text style={styles.label}>Color Analysis:</Text>
        <Text style={styles.value}>{colorAnalysis}</Text>
      </View>
      <View style={styles.resultBox}>
        <Text style={styles.label}>Style Recommendations:</Text>
        <Text style={styles.value}>{styleRecommendations}</Text>
      </View>

      {/* Save to Blockchain Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save to Blockchain</Text>
      </TouchableOpacity>

      {/* Back to Home Button */}
      <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#25292e",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  photoLabel: {
    fontSize: 18,
    color: "#aaa",
    marginBottom: 10,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#1e1e2e",
  },
  resultBox: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#1e1e2e",
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    color: "#aaa",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
