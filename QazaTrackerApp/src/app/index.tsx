import { useEffect } from "react";
import { router, Redirect } from "expo-router";
import { useQaza } from "@/store/useQazaStore";

export default function IndexRoute() {
  const { ready, profile } = useQaza();

  useEffect(() => {
    if (ready && !profile) router.replace("/welcome");
  }, [ready, profile]);

  if (ready && profile) return <Redirect href="/(tabs)/home" />;
  if (ready && !profile) return <Redirect href="/welcome" />;
  return null;
}
