import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ThemedIcon } from "@/components/ThemedIcon";
import AppButton from "@/components/AppButton";
import { images } from "@/constants/images";
import { z } from "zod";
import { useSignIn } from "@clerk/clerk-expo";
import FormField from "@/modules/auth/ui/components/FormField";
import {
  OAuthButton,
  OAuthProvider,
} from "@/modules/auth/ui/components/OAuthButton";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginView = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginForm, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginForm] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);

      try {
        const result = await signIn?.create({
          identifier: form.username,
          password: form.password,
        });

        if (result?.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          router.push("/");
        }
      } catch (error: any) {
        Alert.alert("Error", error.errors[0]?.message || "Sign in failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const disabled =
    loading || !isLoaded || form.username === "" || form.password === "";

  return (
    <View className="flex-1 bg-background px-10 py-20">
      {/* Header */}
      <View className="items-start mt-16 mb-20">
        <Text className="text-accent-foreground text-[36px] font-semibold">
          Login
        </Text>
      </View>

      {/* Form Section */}
      <View className="flex-1 gap-8">
        {/* Username Input */}
        <FormField
          placeholder="Username"
          value={form.username}
          onChangeText={(value) => handleInputChange("username", value)}
          icon="user"
          iconLibrary="fontawesome6"
          error={errors.username}
          autoCapitalize="none"
        />

        {/* Password Input */}
        <FormField
          placeholder="Password"
          value={form.password}
          onChangeText={(value) => handleInputChange("password", value)}
          icon="lock"
          iconLibrary="feather"
          error={errors.password}
          showPasswordToggle
          isPassword={!showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoCapitalize="none"
        />

        {/* Forgot Password */}
        <View className="items-end">
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text className="text-accent-foreground font-light">
              Forgot Password ?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View className="mt-8">
          <AppButton title="Login" onPress={handleLogin} disabled={disabled} />
        </View>

        {/* Divider */}
        <View className="items-center mt-8">
          <View className="flex-row items-center w-full">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-gray-400 dark:text-gray-500">
              or with
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-6">
          {/* Google Button */}
          <OAuthButton
            provider="google"
            loading={oauthLoading}
            setLoading={setOAuthLoading}
          />

          {/* Apple Button */}
          <OAuthButton
            provider="apple"
            loading={oauthLoading}
            setLoading={setOAuthLoading}
          />

          {/* Facebook Button */}
          <OAuthButton
            provider="facebook"
            loading={oauthLoading}
            setLoading={setOAuthLoading}
          />
        </View>
      </View>

      {/* Bottom Sign Up Link */}
      <View className="items-center mt-8">
        <View className="flex-row items-center">
          <Text className="text-muted-foreground">Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp} className="ml-1">
            <Text className="text-accent-foreground font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default LoginView;
