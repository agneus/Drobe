import React, { useRef, useState } from "react";
import { View, Dimensions } from "react-native";
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

  const screenHeight = Dimensions.get("window").height;

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
    <View style={{ flex: 1, backgroundColor: "#25292e" }}>
      <CameraView
        style={{ height: screenHeight * 0.8, width: "100%" }}
        facing={facing}
        ref={cameraRef}
      />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "#1c1c1c",
          paddingVertical: 20,
        }}
      >
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
