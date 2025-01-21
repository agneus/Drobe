import React, { useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import PhotoPreview from "@/components/PhotoPreview";
import { useRouter } from "expo-router";
import { usePhoto } from "@/context/PhotoContext";
import { useAnalysis } from "@/context/AnalysisContext";
import { analyzePhoto } from "@/services/aiService";
import { useWallet } from "@/context/WalletContext";

export default function PhotoPreviewScreen() {
  const { photo, clearPhoto } = usePhoto();
  const { setAnalysisResult } = useAnalysis();
  //const { transferTokensToTreasury } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    clearPhoto();
    router.replace("/");
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const result = await analyzePhoto(photo!);
      console.log("AI Analysis Result:", result);

      // Set result in context and navigate to the analysis page
      setAnalysisResult(result);
      setLoading(false);
      router.push("/analysis");
    } catch (error) {
      console.error("Error analyzing photo:", error);
      Alert.alert("Error", "Failed to analyze the photo. Please try again.");
      setLoading(false);
    }
  };

  if (!photo) {
    router.replace("/");
    return null;
  }

  return (
    <View style={styles.container}>
      <PhotoPreview
        photoUri={photo}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
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
    backgroundColor: "#25292e",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
