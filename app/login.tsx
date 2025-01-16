import { View, Text, Button, StyleSheet } from "react-native";
import { useWallet } from "@/context/WalletContext";

export default function LoginScreen() {
  const { connectWallet } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Drobe</Text>
      <Button title="Connect Wallet" onPress={connectWallet} />
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
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
});
