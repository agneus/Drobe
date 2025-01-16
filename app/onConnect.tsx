import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function OnConnect() {
  const router = useRouter();

  useEffect(() => {
    console.log("onConnect route hit");
    // Handle the wallet connection here or redirect elsewhere
    router.push("/"); // Redirect to the home page or another valid route
  }, []);

  return null; // No UI is needed for this route
}
