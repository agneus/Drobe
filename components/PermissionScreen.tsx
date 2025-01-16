import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface PermissionScreenProps {
  onGrant: () => void;
}

export default function PermissionScreen({ onGrant }: PermissionScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        We need your permission to show the camera
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={onGrant}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
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
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#fff",
  },
  permissionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
