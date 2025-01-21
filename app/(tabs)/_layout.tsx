import { Tabs } from "expo-router";
import { useWallet } from "@/context/WalletContext";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#25292e" },
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="airdrop"
        options={{
          tabBarLabel: "Airdrop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
