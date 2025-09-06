import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as z from "zod";
import { ThemedIcon } from "@/components/ThemedIcon";
import AppButton from "@/components/AppButton";
import { images } from "@/constants/images";
import { useSignUp } from "@clerk/clerk-expo";
import FormField from "@/modules/auth/ui/components/FormField";
import {
  OAuthButton,
  OAuthProvider,
} from "@/modules/auth/ui/components/OAuthButton";

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const SignupView = () => {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [form, setForm] = useState<SignupForm>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupForm, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null);

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignupForm] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async () => {
    if (validateForm()) {
      setLoading(true);

      try {
        const result = await signUp?.create({
          username: form.username,
          password: form.password,
        });

        if (result?.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          router.push("/");
        }
      } catch (error: any) {
        Alert.alert("Error", error.errors[0]?.message || "Sign up failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const disabled =
    loading || !isLoaded || form.username === "" || form.password === "";

  return (
    <View className="flex-1 bg-background px-10 py-20">
      {/* Header */}
      <View className="items-start mt-16 mb-20">
        <Text className="text-accent-foreground text-[36px] font-semibold">
          Sign Up
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

        {/* Confirm Password Input */}
        <FormField
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(value) => handleInputChange("confirmPassword", value)}
          icon="lock"
          iconLibrary="feather"
          error={errors.confirmPassword}
          showPasswordToggle
          isPassword={!showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          autoCapitalize="none"
        />

        {/* Create Button */}
        <View className="mt-12">
          <AppButton
            title="Create"
            onPress={handleSignup}
            disabled={disabled}
          />
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

      {/* Bottom Sign In Link */}
      <View className="items-center mt-8">
        <View className="flex-row items-center">
          <Text className="text-muted-foreground">Have any account?</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-1">
            <Text className="text-accent-foreground font-semibold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignupView;
