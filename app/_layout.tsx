import { Stack } from "expo-router";
import { WalletProvider } from "@/context/WalletContext";
import { PhotoProvider } from "@/context/PhotoContext";
import { AnalysisProvider } from "@/context/AnalysisContext";

export default function RootLayout() {
  return (
    <PhotoProvider>
      <WalletProvider>
        <AnalysisProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="photo-preview" />
            <Stack.Screen name="analysis" />
          </Stack>
        </AnalysisProvider>
      </WalletProvider>
    </PhotoProvider>
  );
}
