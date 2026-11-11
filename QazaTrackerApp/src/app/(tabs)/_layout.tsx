import { ColorValue, Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { HomeIcon, PrayIcon, HistoryIcon, BookIcon, GearIcon } from "@/components/icons";
import { colors, fonts, layout } from "@/theme";

/* Floating tab bar, drawn by us instead of the default slot layout: a
 * detached deep-emerald capsule whose content is centered as a whole, so
 * spacing stays even on every device width (the default distributes five
 * equal slots, which scatters the icons on wide screens). The section you
 * are in carries its name inside a soft ivory pill; the others stay
 * icon-only. */

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
              {focused ? <Text style={styles.pillLabel}>{tab.label}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
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
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    // half the height, not 999: oversized radii break on Android when the
    // pill resizes on tab switch (active label mounts/unmounts) and the
    // background renders as a plain rectangle. overflow hidden clips the
    // background to the rounded bounds on every resize.
    borderRadius: 20,
    overflow: "hidden",
  },
  pillIdle: { paddingHorizontal: 8 },
  pillActive: {
    backgroundColor: colors.ivory,
    paddingHorizontal: 14,
  },
  pillLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.emerald,
  },
});
