import React from "react";
import { View, Image, StyleSheet } from "react-native";
import CircularButton from "@/components/CircularButton";

interface PhotoPreviewProps {
  photoUri: string;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function PhotoPreview({
  photoUri,
  onCancel,
  onSubmit,
}: PhotoPreviewProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />
      <View style={styles.actionButtons}>
        <CircularButton
          icon="close-outline"
          onPress={onCancel}
          backgroundColor="#6c757d"
        />
        <CircularButton
          icon="cloud-upload-outline"
          onPress={onSubmit}
          backgroundColor="#4A90E2"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
  },
  preview: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
});
