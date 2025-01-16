import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function OnConnect() {
  const router = useRouter();

  useEffect(() => {
    console.log("onConnect route hit");
    router.push("/");
  }, []);

  return null;
}
