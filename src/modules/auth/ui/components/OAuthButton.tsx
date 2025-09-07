import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { isClerkAPIResponseError, useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { ThemedIcon } from "@/components/ThemedIcon";
import { useRouter } from "expo-router";
import { images } from "@/constants/images";

export type OAuthProvider = "google" | "apple" | "facebook";

interface OAuthButtonProps {
  provider: OAuthProvider;
  loading: OAuthProvider | null;
  setLoading: (loading: OAuthProvider | null) => void;
}

const providerConfig = {
  google: {
    icon: "google",
    iconType: "image" as const,
  },
  apple: {
    icon: "apple",
    iconType: "icon" as const,
    library: "fontawesome6" as const,
  },
  facebook: {
    icon: "facebook",
    iconType: "image" as const,
  },
};

export function OAuthButton({
  provider,
  loading,
  setLoading,
}: OAuthButtonProps) {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const config = providerConfig[provider];
  const isLoading = loading === provider;
  const isDisabled = loading !== null;

  const handleSignInWithSSO = async () => {
    setLoading(provider);
    const oauthType = `oauth_${provider}` as const;

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: oauthType,
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        console.log("createdSessionId", createdSessionId);
        await setActive!({ session: createdSessionId });
        router.replace("/home");
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert("Error", error.errors[0]?.longMessage || "Sign in failed");
        console.error(error.errors[0]?.longMessage);
      } else {
        Alert.alert("Error", "Sign in failed");
        console.error(error);
      }
    } finally {
      setLoading(null);
    }
  };

  const renderIcon = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" className="text-foreground" />;
    }

    if (config.iconType === "image") {
      return (
        <Image
          source={images[config.icon as keyof typeof images]}
          className="size-8"
        />
      );
    } else {
      return (
        <ThemedIcon name={config.icon} size={28} library={config.library} />
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignInWithSSO}
      disabled={isDisabled}
      className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
      style={provider === "apple" ? { paddingBottom: 4 } : {}}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
}
