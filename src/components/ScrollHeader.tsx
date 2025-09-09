import React from "react";
import { Animated, Text, useColorScheme } from "react-native";

interface ScrollHeaderProps {
  children: React.ReactNode;
  opacity: Animated.AnimatedInterpolation<number>;
  className?: string;
  height?: number;
}

export const ScrollHeader = ({
  children,
  opacity,
  className = "",
  height = 90,
}: ScrollHeaderProps) => {
  const colorScheme = useColorScheme();
  const shadowColor = colorScheme === "dark" ? "#334155" : "#ECEAFF";

  return (
    <Animated.View
      className={`absolute top-0 left-0 right-0 z-10 bg-background ${className}`}
      style={{
        opacity,
        paddingTop: 60,
        height: height,
        shadowColor: shadowColor,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      {children}
    </Animated.View>
  );
};
