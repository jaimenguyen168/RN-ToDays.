import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
}

const ProfileImageUpload = ({ currentImageUrl }: ProfileImageUploadProps) => {
  const generateUploadUrl = useMutation(api.private.storage.generateUploadUrl);
  const updateProfileImage = useMutation(api.private.users.updateProfileImage);
  const getFileUrl = useMutation(api.private.storage.getFileUrl);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log(result);

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const confirmAndUpload = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);

      const uploadUrl = await generateUploadUrl();

      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResponse.json();

      const imageUrl = await getFileUrl({ storageId });

      if (!imageUrl) {
        throw new Error("Failed to get image URL");
      }

      await updateProfileImage({ imageUrl });

      console.log("Profile image updated successfully");
      setShowPreview(false);
      setSelectedImage(null);

      Alert.alert("Success", "Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedImage(null);
    setShowPreview(false);
  };

  if (showPreview && selectedImage) {
    return (
      <View className="items-center">
        <View className="relative">
          <Image
            source={{ uri: selectedImage }}
            className="w-32 h-32 rounded-full"
            resizeMode="cover"
          />
          {isUploading && (
            <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
              <Text className="text-white text-xs">Uploading...</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            onPress={cancelSelection}
            disabled={isUploading}
            className="w-24 h-8 rounded-lg bg-card flex items-center justify-center"
          >
            <Text className="text-foreground">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmAndUpload}
            disabled={isUploading}
            className="w-24 h-8 rounded-lg bg-app-primary flex items-center justify-center"
          >
            <Text className="text-white">
              {isUploading ? <ActivityIndicator color="white" /> : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={pickImage} disabled={isUploading}>
      <Image
        source={{ uri: currentImageUrl }}
        className="w-24 h-24 rounded-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default ProfileImageUpload;
