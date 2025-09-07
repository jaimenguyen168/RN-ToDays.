import React from "react";
import { View, Text, useColorScheme } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";

export interface MenuItem {
  title: string;
  icon: string;
  library?: IconLibrary;
  onPress: () => void;
  lightColor?: string;
  darkColor?: string;
}

interface DropdownMenuProps {
  menuItems: MenuItem[];
  children: React.ReactNode;
  menuWidth?: number;
}

const DropdownMenu = ({
  menuItems,
  children,
  menuWidth = 120,
}: DropdownMenuProps) => {
  const colorScheme = useColorScheme();

  return (
    <Menu>
      <MenuTrigger
        customStyles={{
          triggerTouchable: {
            backgroundColor: "transparent",
            underlayColor: "transparent",
            activeOpacity: 0.6,
          },
        }}
      >
        {children}
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            width: menuWidth,
            backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "white",
            borderRadius: 12,
            padding: 4,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        }}
      >
        {menuItems.map((item, index) => (
          <MenuOption
            key={index}
            onSelect={item.onPress}
            customStyles={{
              optionTouchable: {
                underlayColor: "transparent",
              },
            }}
          >
            <View className="flex-row items-center px-3 py-1 gap-3">
              <ThemedIcon
                name={item.icon as any}
                size={16}
                library={item.library}
                lightColor={item.lightColor}
                darkColor={item.darkColor}
              />
              <Text className="text-foreground font-medium">{item.title}</Text>
            </View>
          </MenuOption>
        ))}
      </MenuOptions>
    </Menu>
  );
};

export default DropdownMenu;
