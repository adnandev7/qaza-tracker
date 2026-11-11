/**
 * icons.tsx — minimal 24px line icons for the tab bar (stroke = currentColor).
 * Geometric, no faces/figures; consistent 1.8 stroke weight.
 */

import Svg, { Circle, Path, Line } from "react-native-svg";
import type { ColorValue } from "react-native";

type P = { color: ColorValue; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function HomeIcon({ color, size = 22 }: P) {
  return (
    <Svg {...base(size)} stroke={color}>
      {/* mosque dome home */}
      <Path d="M4 20 V12 a8 8 0 0 1 16 0 v8" />
      <Path d="M2.5 20 h19" />
      <Path d="M12 4 v-2" />
      <Circle cx="12" cy="12" r="2" />
    </Svg>
  );
}

export function PrayIcon({ color, size = 22 }: P) {
  return (
    <Svg {...base(size)} stroke={color}>
      {/* crescent + star */}
      <Path d="M18.5 14.5 A7.5 7.5 0 1 1 9.5 3.2 a6 6 0 1 0 9 11.3 Z" />
      <Path d="M17.5 6.5 l0.8 1.6 1.7 0.3 -1.2 1.2 0.3 1.7 -1.6 -0.8 -1.6 0.8 0.3 -1.7 -1.2 -1.2 1.7 -0.3 Z" strokeWidth={1.2} />
    </Svg>
  );
}

export function HistoryIcon({ color, size = 22 }: P) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Circle cx="12" cy="12" r="8.5" />
      <Path d="M12 7.5 V12 l3 2" />
    </Svg>
  );
}

export function BookIcon({ color, size = 22 }: P) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M4 5.5 A2 2 0 0 1 6 3.5 h13 v17 H6 a2 2 0 0 1 -2 -2 Z" />
      <Path d="M4 16.5 a2 2 0 0 1 2 -2 h13" />
      <Line x1="8" y1="7.5" x2="14" y2="7.5" />
    </Svg>
  );
}

export function GearIcon({ color, size = 22 }: P) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Circle cx="12" cy="12" r="3.2" />
      <Path d="M12 2.8 v2.4 M12 18.8 v2.4 M2.8 12 h2.4 M18.8 12 h2.4 M5.5 5.5 l1.7 1.7 M16.8 16.8 l1.7 1.7 M18.5 5.5 l-1.7 1.7 M7.2 16.8 l-1.7 1.7" />
    </Svg>
  );
}
