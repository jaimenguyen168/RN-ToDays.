import React from "react";
import {
  Ionicons,
  FontAwesome6,
  MaterialIcons,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useColorScheme } from "react-native";

type IoniconsName = keyof typeof Ionicons.glyphMap;
type FontAwesome6Name = keyof typeof FontAwesome6.glyphMap;
type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type AntDesignName = keyof typeof AntDesign.glyphMap;
type FeatherName = keyof typeof Feather.glyphMap;
type MaterialCommunityIconsName = keyof typeof MaterialCommunityIcons.glyphMap;

export type IconLibrary =
  | "ionicons"
  | "fontawesome6"
  | "material"
  | "antdesign"
  | "feather"
  | "material-community";

interface BaseIconProps {
  size?: number;
  lightColor?: string;
  darkColor?: string;
  style?: any;
}

interface IoniconsProps extends BaseIconProps {
  library?: "ionicons";
  name: IoniconsName;
}

interface FontAwesome6Props extends BaseIconProps {
  library: "fontawesome6";
  name: FontAwesome6Name;
}

interface MaterialIconsProps extends BaseIconProps {
  library: "material";
  name: MaterialIconsName;
}

interface AntDesignProps extends BaseIconProps {
  library: "antdesign";
  name: AntDesignName;
}

interface FeatherProps extends BaseIconProps {
  library: "feather";
  name: FeatherName;
}

interface MaterialCommunityIconsProps extends BaseIconProps {
  library: "material-community";
  name: MaterialCommunityIconsName;
}

export type ThemedIconProps =
  | IoniconsProps
  | FontAwesome6Props
  | MaterialIconsProps
  | AntDesignProps
  | FeatherProps
  | MaterialCommunityIconsProps;

export function ThemedIcon({
  name,
  size = 24,
  lightColor = "#1a1a1a",
  darkColor = "#ffffff",
  style,
  library = "ionicons",
}: ThemedIconProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? darkColor : lightColor;

  switch (library) {
    case "fontawesome6":
      return (
        <FontAwesome6
          name={name as FontAwesome6Name}
          size={size}
          color={color}
          style={style}
        />
      );

    case "material":
      return (
        <MaterialIcons
          name={name as MaterialIconsName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "antdesign":
      return (
        <AntDesign
          name={name as AntDesignName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "feather":
      return (
        <Feather
          name={name as FeatherName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "material-community":
      return (
        <MaterialCommunityIcons
          name={name as MaterialCommunityIconsName}
          size={size}
          color={color}
          style={style}
        />
      );

    default:
      // Default to Ionicons
      return (
        <Ionicons
          name={name as IoniconsName}
          size={size}
          color={color}
          style={style}
        />
      );
  }
}
