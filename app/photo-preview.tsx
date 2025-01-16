import React from "react";
import { View, StyleSheet } from "react-native";
import PhotoPreview from "@/components/PhotoPreview";
import { useRouter } from "expo-router";
import { usePhoto } from "@/context/PhotoContext";

export default function PhotoPreviewScreen() {
  const { photo, clearPhoto } = usePhoto();
  const router = useRouter();

  const handleCancel = () => {
    clearPhoto();
    router.replace("/"); // Return to the camera view
  };

  const handleSubmit = () => {
    console.log("Submit button pressed");
    // Placeholder for submission logic
  };

  if (!photo) {
    router.replace("/"); // Return to the camera view
    return null;
  }

  return (
    <View style={styles.container}>
      <PhotoPreview
        photoUri={photo}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
  },
});
