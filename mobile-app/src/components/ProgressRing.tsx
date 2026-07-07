// ProgressRing — circular progress indicator using react-native-svg.

import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 72,
  strokeWidth = 8,
  color = "#10b981",
  trackColor = "#e4e4e7",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, position: "relative", alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
        />
      </Svg>
      {children && (
        <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
          {children}
        </View>
      )}
    </View>
  );
}
