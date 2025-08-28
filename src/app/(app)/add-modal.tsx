import { View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AddModal() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Task",
          presentation: "modal",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-white p-4">
        <Text className="text-xl font-semibold mb-4">Add New Task</Text>
        {/* Your add task form content here */}

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mt-4"
          onPress={() => {
            // Handle task creation
            router.back(); // Close modal after saving
          }}
        >
          <Text className="text-white text-center font-semibold">
            Save Task
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
