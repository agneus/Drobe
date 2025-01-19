import { Redirect } from "expo-router";

export default function CatchAllRoute() {
  // Redirect all unmatched routes to the home screen
  return <Redirect href="/" />;
}
