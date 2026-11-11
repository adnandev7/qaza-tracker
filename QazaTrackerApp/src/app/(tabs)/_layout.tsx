import { useEffect, useRef } from "react";
import {
  BackHandler, ColorValue, Platform, Pressable, StyleSheet, Text,
  ToastAndroid, View,
} from "react-native";
import { Tabs, router, useSegments } from "expo-router";
import { HomeIcon, PrayIcon, HistoryIcon, BookIcon, GearIcon } from "@/components/icons";
import { colors, fonts, layout } from "@/theme";

/* Floating tab bar, drawn by us instead of the default slot layout: a
 * detached deep-emerald capsule whose content is centered as a whole, so
 * spacing stays even on every device width. Every tab carries its name
 * under its icon, always visible (users never have to guess which section
 * is which); the section you are in sits on a soft ivory pill with emerald
 * ink, the others stay muted.
 *
 * Android hardware back means "previous page", not "close the app": the
 * order of visited tabs is tracked and back walks through it. Once back at
 * the starting tab, a second press within two seconds leaves the app (with
 * a hint), the way Android apps normally behave. */

const TABS: Record<
  string,
  { Icon: (p: { color: ColorValue }) => React.ReactNode; label: string }
> = {
  home: { Icon: HomeIcon, label: "Home" },
  pray: { Icon: PrayIcon, label: "Pray" },
  history: { Icon: HistoryIcon, label: "History" },
  masail: { Icon: BookIcon, label: "Masail" },
  settings: { Icon: GearIcon, label: "Settings" },
};

/** Typed route for each tab, for the back-history navigation. */
const TAB_PATHS: Record<string, "/(tabs)/home" | "/(tabs)/pray" | "/(tabs)/history" | "/(tabs)/masail" | "/(tabs)/settings"> = {
  home: "/(tabs)/home",
  pray: "/(tabs)/pray",
  history: "/(tabs)/history",
  masail: "/(tabs)/masail",
  settings: "/(tabs)/settings",
};

/** Structural subset of the tab-bar props expo-router hands us (kept local
 *  so we don't import from @react-navigation's package layout). */
type FloatingTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  emitter: {
    emit: (e: {
      type: "tabPress";
      target?: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
  };
  navigateToTab: (routeKey: string) => void;
  insets: { bottom: number };
};

function FloatingTabBar({ state, emitter, navigateToTab, insets }: FloatingTabBarProps) {
  return (
    <View
      style={[
        styles.bar,
        { bottom: layout.tabBarFloat + insets.bottom },
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS[route.name] ?? { Icon: HomeIcon, label: route.name };
        const onPress = () => {
          const event = emitter.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.65 }]}
          >
            <View
              style={[
                styles.pill,
                focused ? styles.pillActive : styles.pillIdle,
              ]}
            >
              <tab.Icon color={focused ? colors.emerald : colors.onHeroMuted} />
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                style={[styles.pillLabel, focused && styles.pillLabelActive]}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Android hardware back: pop back through the tabs the user visited. The
 *  history is a plain ref (not state): it never renders, it only answers
 *  back presses. When the walk reaches the starting tab, the first press
 *  shows a hint and the second press within two seconds exits. */
function useTabBackHistory() {
  const segments = useSegments();
  const current = segments[segments.length - 1] ?? "home";
  const historyRef = useRef<string[]>([current]);
  const lastBackAtRef = useRef(0);

  useEffect(() => {
    const hist = historyRef.current;
    if (hist[hist.length - 1] !== current) {
      hist.push(current);
      if (hist.length > 24) hist.splice(0, hist.length - 24);
    }
  }, [current]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const hist = historyRef.current;
      if (hist.length > 1) {
        hist.pop();
        const prev = hist[hist.length - 1];
        router.navigate(TAB_PATHS[prev] ?? "/(tabs)/home");
        return true;
      }
      const now = Date.now();
      if (now - lastBackAtRef.current < 2000) return false; // let the app exit
      lastBackAtRef.current = now;
      ToastAndroid.show("Press back again to leave", ToastAndroid.SHORT);
      return true;
    });
    return () => sub.remove();
  }, []);
}

export default function TabsLayout() {
  useTabBackHistory();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.ivory, shadowOpacity: 0, elevation: 0 },
        headerTitleStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 17,
          color: colors.ink,
        },
        headerTintColor: colors.emerald,
      }}
    >
      <Tabs.Screen name="home" options={{ headerTitle: "Qaza Tracker" }} />
      <Tabs.Screen name="pray" options={{ headerTitle: "Prayer Session" }} />
      <Tabs.Screen name="history" options={{ headerTitle: "History" }} />
      <Tabs.Screen name="masail" options={{ headerTitle: "Masail & Guidance" }} />
      <Tabs.Screen name="settings" options={{ headerTitle: "Settings" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: layout.screenGutter,
    right: layout.screenGutter,
    height: layout.tabBarHeight,
    // exactly half the height: an oversized radius (999) is a known Android
    // trap where the rounded background breaks once the view resizes
    borderRadius: layout.tabBarHeight / 2,
    backgroundColor: colors.deepEmerald,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    elevation: 6,
    shadowColor: colors.deepEmerald,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  // icon over label, both always visible; the pill no longer resizes on
  // tab switch (labels never mount/unmount), which also keeps the rounded
  // background safe on Android
  pill: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    height: 50,
    borderRadius: 20,
    overflow: "hidden",
  },
  pillIdle: { paddingHorizontal: 6 },
  pillActive: {
    backgroundColor: colors.ivory,
    paddingHorizontal: 11,
  },
  pillLabel: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 13,
    color: colors.onHeroMuted,
  },
  pillLabelActive: {
    fontFamily: fonts.semiBold,
    color: colors.emerald,
  },
});
