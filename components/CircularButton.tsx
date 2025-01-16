import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CircularButtonProps {
  icon: any;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function CircularButton({
  icon,
  onPress,
  size = 28,
  color = "white",
  backgroundColor = "#6c757d",
}: CircularButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
