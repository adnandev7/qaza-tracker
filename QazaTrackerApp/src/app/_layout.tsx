// Web-only global styles (input focus ring, caret color); ignored in native builds.
import "../../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { hydrate } from "@/store/useQazaStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Inter — the ONE Latin family (hierarchy via weight only); Amiri for Arabic lines.
  // Fonts live in assets/fonts (copied from @expo-google-fonts) so web builds never
  // reference node_modules paths, which some static hosts refuse to upload.
  const [fontsLoaded, fontsError] = useFonts({
    Inter_300Light: require("../../assets/fonts/Inter_300Light.ttf"),
    Inter_400Regular: require("../../assets/fonts/Inter_400Regular.ttf"),
    Inter_500Medium: require("../../assets/fonts/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("../../assets/fonts/Inter_700Bold.ttf"),
    Amiri_400Regular: require("../../assets/fonts/Amiri_400Regular.ttf"),
  });

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
