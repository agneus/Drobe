import { Stack } from "expo-router";
import { WalletProvider } from "@/context/WalletContext";
import { PhotoProvider } from "@/context/PhotoContext";

export default function RootLayout() {
  return (
    <PhotoProvider>
      <WalletProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="photo-preview" />
        </Stack>
      </WalletProvider>
    </PhotoProvider>
  );
}
