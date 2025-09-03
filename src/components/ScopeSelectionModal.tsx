import { View, Text, Modal, TouchableOpacity } from "react-native";
import React from "react";

export type ScopeType = "this_only" | "all" | "this_and_future";

interface ScopeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onScopeSelect: (scope: ScopeType) => void;
  title: string;
  subtitle: string;
  actionType: "edit" | "delete";
}

const ScopeSelectionModal = ({
  visible,
  onClose,
  onScopeSelect,
  title,
  subtitle,
  actionType,
}: ScopeSelectionModalProps) => {
  const getActionText = (scope: ScopeType) => {
    const action = actionType === "edit" ? "Edit" : "Delete";

    switch (scope) {
      case "this_only":
        return `${action} this task only`;
      case "all":
        return `${action} all tasks`;
      case "this_and_future":
        return `${action} this and future tasks`;
    }
  };

  const getDescriptionText = (scope: ScopeType) => {
    const action = actionType === "edit" ? "Edit" : "Delete";

    switch (scope) {
      case "this_only":
        return `${action} only this specific instance`;
      case "all":
        return `${action} all tasks in this recurring series`;
      case "this_and_future":
        return `${action} this task and all future ones in the series`;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-6">
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-muted rounded-full mb-4" />
            <Text className="text-xl font-semibold text-foreground">
              {title}
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              {subtitle}
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={() => onScopeSelect("this_only")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">
                {getActionText("this_only")}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {getDescriptionText("this_only")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onScopeSelect("all")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">
                {getActionText("all")}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {getDescriptionText("all")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onScopeSelect("this_and_future")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">
                {getActionText("this_and_future")}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {getDescriptionText("this_and_future")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 p-4 bg-secondary rounded-xl"
          >
            <Text className="text-center text-foreground font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default ScopeSelectionModal;
