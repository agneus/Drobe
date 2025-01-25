import React, { useRef, useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import CircularButton from "@/components/CircularButton";
import PermissionScreen from "@/components/PermissionScreen";
import { usePhoto } from "@/context/PhotoContext";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);
  const { setPhoto } = usePhoto();
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return <PermissionScreen onGrant={requestPermission} />;
  }

  const toggleCameraType = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo && photo.uri) {
        setPhoto(photo.uri); // Store the photo in context
        router.push("/photo-preview"); // Navigate to the photo preview screen
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraView} facing={facing} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <CircularButton
          icon="camera-reverse-outline"
          onPress={toggleCameraType}
          backgroundColor="#6c757d"
        />
        <CircularButton
          icon="camera-outline"
          onPress={takePhoto}
          backgroundColor="#007bff"
          size={36}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  cameraView: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingVertical: 15,
  },
});
