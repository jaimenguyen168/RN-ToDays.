import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";

interface FormFieldProps extends TextInputProps {
  label?: string;
  icon?: string;
  iconLibrary?: IconLibrary;
  error?: string;
  showPasswordToggle?: boolean;
  isPassword?: boolean;
  onTogglePassword?: () => void;
}

const FormField = ({
  label,
  icon,
  iconLibrary = "ionicons",
  error,
  showPasswordToggle = false,
  isPassword = false,
  onTogglePassword,
  ...textInputProps
}: FormFieldProps) => {
  return (
    <View>
      {label && (
        <Text className="text-foreground text-sm font-medium mb-2">
          {label}
        </Text>
      )}

      <View className="flex-row items-center border-b border-border pb-3 gap-4">
        {icon && (
          <ThemedIcon
            name={icon as any}
            size={20}
            library={iconLibrary}
            lightColor="#64748B"
            darkColor="#94A3B8"
          />
        )}

        <TextInput
          {...textInputProps}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-foreground font-light text-lg tracking-wider"
          secureTextEntry={isPassword}
        />

        {showPasswordToggle && (
          <TouchableOpacity onPress={onTogglePassword}>
            <ThemedIcon
              name={isPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              lightColor="#64748B"
              darkColor="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default FormField;
