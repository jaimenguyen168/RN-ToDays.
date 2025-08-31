import React from "react";
import { Animated, Text, useColorScheme } from "react-native";

interface ScrollHeaderProps {
  title: string;
  opacity: Animated.AnimatedInterpolation<number>;
  className?: string;
}

export const ScrollHeader = ({
  title,
  opacity,
  className = "",
}: ScrollHeaderProps) => {
  const colorScheme = useColorScheme();
  const shadowColor = colorScheme === "dark" ? "#334155" : "#ECEAFF";

  return (
    <Animated.View
      className={`absolute top-0 left-0 right-0 z-10 bg-background ${className}`}
      style={{
        opacity,
        paddingTop: 60,
        height: 90,
        shadowColor: shadowColor,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      <Text className="text-foreground text-lg font-semibold text-center">
        {title}
      </Text>
    </Animated.View>
  );
};
