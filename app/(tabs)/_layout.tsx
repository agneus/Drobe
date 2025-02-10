import { Tabs } from "expo-router";
import { useWallet } from "@/context/WalletContext";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    //return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0D0D0F", // Super dark shade for high contrast
          borderTopWidth: 0,
          paddingTop: 0,
          paddingBottom: 4, // Reduced bottom padding for balance
          height: 60,
        },
        tabBarActiveTintColor: "#1E90FF", // Vibrant blue for active items
        tabBarInactiveTintColor: "#A5A5A5", // Softer gray for inactive items
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Camera",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
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
