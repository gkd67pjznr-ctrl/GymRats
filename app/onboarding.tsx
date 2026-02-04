// app/onboarding.tsx
// Main onboarding screen with step routing

import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, TextInput, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingStore, useCurrentOnboardingStep, PERSONALITIES } from "../src/lib/stores/onboardingStore";
import { useAvatarStore } from "../src/lib/avatar/avatarStore";
import { KEY_LIFTS, setBaselinePR } from "../src/lib/stores/prStore";
import { lbToKg } from "../src/lib/units";
import type { AvatarArtStyle } from "../src/lib/avatar/avatarTypes";
import { useThemeColors } from "../src/ui/theme";
import { FR } from "../src/ui/GrStyle";

export default function OnboardingScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const currentStep = useCurrentOnboardingStep();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
          statusBarStyle: "light",
          statusBarBackgroundColor: c.bg,
        }}
      />

      {/* Step content rendered here */}
      <OnboardingContent currentStep={currentStep} />
    </View>
  );
}

function OnboardingContent({ currentStep }: { currentStep: string }) {
  switch (currentStep) {
    case "welcome":
      return <WelcomeStep />;
    case "avatar":
      return <AvatarCreationStep />;
    case "goals":
      return <GoalSettingStep />;
    case "profile":
      return <ProfileSetupStep />;
    case "lifts":
      return <LiftsStep />;
    case "personality":
      return <PersonalityPickerStep />;
    case "highlights":
      return <HighlightsStep />;
    case "tutorial":
      return <TutorialStep />;
    case "complete":
      return <CompletionStep />;
    default:
      return <WelcomeStep />;
  }
}

// Step 1: Welcome
function WelcomeStep() {
  const c = useThemeColors();
  const router = useRouter();
  const { setCurrentStep, startOnboarding } = useOnboardingStore();

  const handleStart = () => {
    startOnboarding();
    setCurrentStep("avatar");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: FR.space.x6, gap: FR.space.x6 }}>
      <View style={{ gap: FR.space.x4, alignItems: "center" }}>
        <Text style={{ fontSize: 64 }}>💪</Text>
        <Text style={{ color: c.text, ...FR.type.h1, textAlign: "center" }}>
          Welcome to GymRats
        </Text>
        <Text style={{ color: c.muted, ...FR.type.body, textAlign: "center" }}>
          The ranking system for lifters. Track your strength, compete with friends, and earn your rank.
        </Text>
      </View>

      <View style={{ gap: FR.space.x3 }}>
        <FeatureItem icon="🏆" title="20 Ranks" description="Per exercise, based on verified standards" />
        <FeatureItem icon="📊" title="Track Everything" description="Workouts, PRs, volume, and streaks" />
        <FeatureItem icon="🔥" title="Compete" description="Leaderboards and social feed with friends" />
      </View>

      <Pressable
        onPress={handleStart}
        accessibilityLabel="Let's get started"
        accessibilityRole="button"
        style={({ pressed }) => ({
          ...FR.pillButton({ card: c.card, border: c.border }),
          backgroundColor: c.text,
          paddingVertical: FR.space.x4,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Let's Get Started</Text>
      </Pressable>
    </View>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{title}</Text>
        <Text style={{ color: c.muted, ...FR.type.sub }}>{description}</Text>
      </View>
    </View>
  );
}

// Step 2: Avatar Creation
function AvatarCreationStep() {
  const c = useThemeColors();
  const { setCurrentStep } = useOnboardingStore();
  const { setArtStyle } = useAvatarStore();
  const [selectedStyle, setSelectedStyle] = useState<AvatarArtStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const artStyles: { id: AvatarArtStyle; name: string; description: string; emoji: string }[] = [
    { id: "bitmoji", name: "Bitmoji", description: "Cartoon style avatars", emoji: "👤" },
    { id: "pixel", name: "Pixel", description: "Retro pixel art", emoji: "🎮" },
    { id: "retro", name: "Retro", description: "80s/90s retro aesthetic", emoji: "📼" },
    { id: "3d", name: "3D", description: "Modern 3D characters", emoji: "🕶️" },
  ];

  const handleNext = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedStyle) {
        const success = await setArtStyle(selectedStyle);
        if (!success) {
          throw new Error("Failed to set avatar style");
        }
      } else {
        // Assign default art style if skipped
        const success = await setArtStyle("bitmoji");
        if (!success) {
          throw new Error("Failed to set default avatar style");
        }
      }
      setCurrentStep("goals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save avatar style");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assign default art style when skipping
      const success = await setArtStyle("bitmoji");
      if (!success) {
        throw new Error("Failed to set default avatar style");
      }
      setCurrentStep("goals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save avatar style");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
      <View style={{ gap: FR.space.x2 }}>
        <Text style={{ color: c.text, ...FR.type.h1 }}>Create your avatar</Text>
        <Text style={{ color: c.muted, ...FR.type.sub }}>Pick an art style. You can customize it later.</Text>
      </View>

      <View style={{ gap: FR.space.x3, flex: 1 }}>
        {artStyles.map((style) => (
          <Pressable
            key={style.id}
            onPress={() => setSelectedStyle(style.id)}
            style={({ pressed }) => ({
              ...FR.card({ card: c.card, border: selectedStyle === style.id ? c.text : c.border }),
              padding: FR.space.x4,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
              <Text style={{ fontSize: 32 }}>{style.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{style.name}</Text>
                <Text style={{ color: c.muted, ...FR.type.sub }}>{style.description}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {error && (
        <Text style={{ color: "#FF6B6B", ...FR.type.sub, textAlign: "center" }}>
          {error}
        </Text>
      )}

      <View style={{ gap: FR.space.x2 }}>
        <Pressable
          onPress={handleNext}
          disabled={loading}
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: loading ? c.muted : c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : loading ? 0.6 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator size="small" color={c.bg} />
          ) : (
            <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>
              {selectedStyle ? "Continue" : "Skip"}
            </Text>
          )}
        </Pressable>
        {selectedStyle && (
          <Pressable
            onPress={handleSkip}
            disabled={loading}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : loading ? 0.5 : 1 })}
          >
            <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Skip for now</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setCurrentStep("welcome")}
          disabled={loading}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : loading ? 0.5 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Step 3: Goal Setting
function GoalSettingStep() {
  const c = useThemeColors();
  const { setCurrentStep, setGoal } = useOnboardingStore();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goalOptions = [
    { id: "strength", name: "Strength", description: "Get stronger, lift heavier", emoji: "💪" },
    { id: "aesthetics", name: "Aesthetics", description: "Build muscle, look good", emoji: "🏋️" },
    { id: "health", name: "Health", description: "Stay active, feel better", emoji: "❤️" },
    { id: "sport", name: "Sport", description: "Improve performance", emoji: "⚽" },
    { id: "general", name: "General", description: "Just stay active", emoji: "👟" },
  ];

  const handleNext = () => {
    if (selectedGoal) {
      setGoal(selectedGoal as any);
    }
    setCurrentStep("profile");
  };

  const handleSkip = () => {
    setCurrentStep("profile");
  };

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
      <View style={{ gap: FR.space.x2 }}>
        <Text style={{ color: c.text, ...FR.type.h1 }}>What are you training for?</Text>
        <Text style={{ color: c.muted, ...FR.type.sub }}>This helps us personalize your experience. You can change this later.</Text>
      </View>

      <View style={{ gap: FR.space.x3, flex: 1 }}>
        {goalOptions.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() => setSelectedGoal(goal.id)}
            style={({ pressed }) => ({
              ...FR.card({ card: c.card, border: selectedGoal === goal.id ? c.text : c.border }),
              padding: FR.space.x4,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
              <Text style={{ fontSize: 32 }}>{goal.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{goal.name}</Text>
                <Text style={{ color: c.muted, ...FR.type.sub }}>{goal.description}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: FR.space.x2 }}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>
            {selectedGoal ? "Continue" : "Skip"}
          </Text>
        </Pressable>
        {selectedGoal && (
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Skip for now</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setCurrentStep("avatar")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Step 4: Profile Setup
function ProfileSetupStep() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { setCurrentStep, setProfile } = useOnboardingStore();
  const [displayName, setDisplayName] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [experience, setExperience] = useState<"" | "beginner" | "intermediate" | "advanced">("");
  const [validationErrors, setValidationErrors] = useState<{
    displayName?: string;
    bodyweight?: string;
    experience?: string;
  }>({});

  const handleNext = () => {
    const errors: typeof validationErrors = {};

    // Validate display name
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      errors.displayName = "Please enter your name";
    } else if (trimmedName.length > 50) {
      errors.displayName = "Name must be less than 50 characters";
    }

    // Validate bodyweight
    if (!bodyweight.trim()) {
      errors.bodyweight = "Please enter your bodyweight";
    } else {
      const weightNum = parseFloat(bodyweight);
      if (isNaN(weightNum) || weightNum <= 0) {
        errors.bodyweight = "Please enter a valid positive number";
      } else if (unit === "kg" && weightNum > 300) {
        errors.bodyweight = "Weight cannot exceed 300 kg";
      } else if (unit === "lb" && weightNum > 660) {
        errors.bodyweight = "Weight cannot exceed 660 lb";
      }
    }

    // Validate experience
    if (!experience) {
      errors.experience = "Please select your experience level";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear any previous errors
    setValidationErrors({});

    // Convert to kg for storage
    const weightNum = parseFloat(bodyweight);
    const weightKg = unit === "kg" ? weightNum : weightNum / 2.20462;

    setProfile({
      displayName: trimmedName,
      bodyweight: weightKg,
      bodyweightUnit: unit,
      experienceLevel: experience,
      personalityId: "coach", // default
    });
    setCurrentStep("lifts");
  };

  const experienceOptions: { value: "beginner" | "intermediate" | "advanced"; label: string; years: string }[] = [
    { value: "beginner", label: "Beginner", years: "0-1 years" },
    { value: "intermediate", label: "Intermediate", years: "1-3 years" },
    { value: "advanced", label: "Advanced", years: "3+ years" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: FR.space.x6,
            gap: FR.space.x6,
            paddingBottom: insets.bottom + FR.space.x6,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: FR.space.x2 }}>
            <Text style={{ color: c.text, ...FR.type.h1 }}>Tell us about yourself</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>This helps us tailor your experience</Text>
          </View>

          <View style={{ gap: FR.space.x4 }}>
            {/* Name input */}
            <View style={{ gap: FR.space.x2 }}>
              <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>Your Name</Text>
              <TextInput
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (validationErrors.displayName) {
                    setValidationErrors((prev) => ({ ...prev, displayName: undefined }));
                  }
                }}
                placeholder="Enter your name"
                placeholderTextColor={c.muted}
                style={{
                  ...FR.card({ card: c.card, border: validationErrors.displayName ? "#FF6B6B" : c.border }),
                  color: c.text,
                  ...FR.type.body,
                  paddingVertical: FR.space.x3,
                  paddingHorizontal: FR.space.x3,
                  minHeight: 48,
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {validationErrors.displayName && (
                <Text style={{ color: "#FF6B6B", ...FR.type.sub, fontSize: 12 }}>
                  {validationErrors.displayName}
                </Text>
              )}
            </View>

            {/* Bodyweight input */}
            <View style={{ gap: FR.space.x2 }}>
              <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>Bodyweight</Text>
              <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
                <TextInput
                  value={bodyweight}
                  onChangeText={(text) => {
                    setBodyweight(text);
                    if (validationErrors.bodyweight) {
                      setValidationErrors((prev) => ({ ...prev, bodyweight: undefined }));
                    }
                  }}
                  placeholder="150"
                  placeholderTextColor={c.muted}
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    ...FR.card({ card: c.card, border: validationErrors.bodyweight ? "#FF6B6B" : c.border }),
                    color: c.text,
                    ...FR.type.body,
                    paddingVertical: FR.space.x3,
                    paddingHorizontal: FR.space.x3,
                    minHeight: 48,
                  }}
                  returnKeyType="done"
                />
                <UnitToggle value={unit} onChange={setUnit} />
              </View>
              {validationErrors.bodyweight && (
                <Text style={{ color: "#FF6B6B", ...FR.type.sub, fontSize: 12 }}>
                  {validationErrors.bodyweight}
                </Text>
              )}
            </View>

            {/* Experience level */}
            <View style={{ gap: FR.space.x2 }}>
              <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>Experience Level</Text>
              <View style={{ gap: FR.space.x2 }}>
                {experienceOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Keyboard.dismiss();
                      setExperience(option.value);
                      if (validationErrors.experience) {
                        setValidationErrors((prev) => ({ ...prev, experience: undefined }));
                      }
                    }}
                    style={({ pressed }) => ({
                      ...FR.card({ card: c.card, border: c.border }),
                      paddingVertical: FR.space.x3,
                      paddingHorizontal: FR.space.x3,
                      backgroundColor: experience === option.value ? c.text : c.card,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: experience === option.value ? c.bg : c.text,
                        ...FR.type.body,
                        fontWeight: "700",
                      }}
                    >
                      {option.label} <Text style={{ fontWeight: "400" }}>({option.years})</Text>
                    </Text>
                  </Pressable>
                ))}
              </View>
              {validationErrors.experience && (
                <Text style={{ color: "#FF6B6B", ...FR.type.sub, fontSize: 12 }}>
                  {validationErrors.experience}
                </Text>
              )}
            </View>
          </View>

          <View style={{ gap: FR.space.x2, marginTop: FR.space.x4 }}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => ({
                ...FR.pillButton({ card: c.card, border: c.border }),
                backgroundColor: c.text,
                paddingVertical: FR.space.x4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Continue</Text>
            </Pressable>
            <Pressable
              onPress={() => setCurrentStep("goals")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function UnitToggle({ value, onChange }: { value: "lb" | "kg"; onChange: (v: "lb" | "kg") => void }) {
  const c = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        ...FR.card({ card: c.card, border: c.border }),
        padding: FR.space.x1,
      }}
    >
      {(["lb", "kg"] as const).map((unit) => (
        <Pressable
          key={unit}
          onPress={() => onChange(unit)}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x2,
            paddingHorizontal: FR.space.x3,
            borderRadius: FR.radius.sm,
            backgroundColor: value === unit ? c.text : "transparent",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            style={{
              color: value === unit ? c.bg : c.text,
              ...FR.type.body,
              fontWeight: "700",
            }}
          >
            {unit.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Step 5: Current Lifts (optional baseline PRs)
function LiftsStep() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { setCurrentStep, profile } = useOnboardingStore();
  const unit = profile?.bodyweightUnit ?? "lb";

  // Track PR values for key lifts
  const [lifts, setLifts] = useState<Record<string, { weight: string; reps: string }>>({
    bench: { weight: "", reps: "" },
    squat: { weight: "", reps: "" },
    deadlift: { weight: "", reps: "" },
    ohp: { weight: "", reps: "" },
  });

  const handleLiftChange = (liftId: string, field: "weight" | "reps", value: string) => {
    setLifts((prev) => ({
      ...prev,
      [liftId]: { ...prev[liftId], [field]: value },
    }));
  };

  const handleNext = () => {
    // Save any entered lifts as baseline PRs
    for (const lift of KEY_LIFTS) {
      const liftData = lifts[lift.id];
      const weight = parseFloat(liftData.weight);
      const reps = parseInt(liftData.reps, 10);

      if (!isNaN(weight) && weight > 0 && !isNaN(reps) && reps > 0) {
        // Convert to kg if user entered in lb
        const weightKg = unit === "kg" ? weight : lbToKg(weight);
        setBaselinePR(lift.id, weightKg, reps);
      }
    }

    setCurrentStep("personality");
  };

  const handleSkip = () => {
    setCurrentStep("personality");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1, backgroundColor: c.bg }}
          contentContainerStyle={{
            padding: FR.space.x6,
            gap: FR.space.x6,
            paddingBottom: insets.bottom + FR.space.x6,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: FR.space.x2 }}>
            <Text style={{ color: c.text, ...FR.type.h1 }}>Your current lifts</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Enter your best lifts so we know when you hit a real PR. This is optional — you can skip and PRs will start tracking after your first workout.
            </Text>
          </View>

          <View style={{ gap: FR.space.x4 }}>
            {KEY_LIFTS.map((lift) => (
              <View key={lift.id} style={{ gap: FR.space.x2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                  <Text style={{ fontSize: 24 }}>{lift.emoji}</Text>
                  <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{lift.name}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
                  <View style={{ flex: 2 }}>
                    <TextInput
                      value={lifts[lift.id].weight}
                      onChangeText={(text) => handleLiftChange(lift.id, "weight", text)}
                      placeholder={`Weight (${unit})`}
                      placeholderTextColor={c.muted}
                      keyboardType="decimal-pad"
                      style={{
                        ...FR.card({ card: c.card, border: c.border }),
                        color: c.text,
                        ...FR.type.body,
                        paddingVertical: FR.space.x3,
                        paddingHorizontal: FR.space.x3,
                        minHeight: 48,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={lifts[lift.id].reps}
                      onChangeText={(text) => handleLiftChange(lift.id, "reps", text)}
                      placeholder="Reps"
                      placeholderTextColor={c.muted}
                      keyboardType="number-pad"
                      style={{
                        ...FR.card({ card: c.card, border: c.border }),
                        color: c.text,
                        ...FR.type.body,
                        paddingVertical: FR.space.x3,
                        paddingHorizontal: FR.space.x3,
                        minHeight: 48,
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>
            Example: If you've benched 185 lb for 5 reps, enter "185" and "5"
          </Text>

          <View style={{ gap: FR.space.x2, marginTop: FR.space.x4 }}>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => ({
                ...FR.pillButton({ card: c.card, border: c.border }),
                backgroundColor: c.text,
                paddingVertical: FR.space.x4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Continue</Text>
            </Pressable>
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Skip for now</Text>
            </Pressable>
            <Pressable
              onPress={() => setCurrentStep("profile")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Personality picker step
function PersonalityPickerStep() {
  const c = useThemeColors();
  const { setCurrentStep, setPersonality } = useOnboardingStore();
  const [selected, setSelected] = useState("");

  const handleNext = () => {
    setPersonality(selected || "coach");
    setCurrentStep("highlights");
  };

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
      <Text style={{ color: c.text, ...FR.type.h1 }}>Pick your gym buddy</Text>
      <Text style={{ color: c.muted, ...FR.type.sub }}>Choose your personality. You can change this later.</Text>

      {/* Personality cards */}
      <View style={{ gap: FR.space.x3, flex: 1 }}>
        {PERSONALITIES.map((personality) => {
          const isSelected = selected === personality.id;
          return (
            <Pressable
              key={personality.id}
              onPress={() => setSelected(personality.id)}
              accessibilityLabel={`Select ${personality.name} personality`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => ({
                ...FR.card({ card: c.card, border: isSelected ? c.text : c.border }),
                padding: FR.space.x4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
                <Text style={{ fontSize: 32 }}>{personality.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{personality.name}</Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>{personality.tagline}</Text>
                  <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 12 }}>{personality.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: FR.space.x2 }}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Continue</Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentStep("lifts")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HighlightsStep() {
  const c = useThemeColors();
  const { setCurrentStep } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;

  const features = [
    {
      emoji: "🏆",
      title: "Track Your Rank",
      description: "Earn 20 ranks per exercise based on verified world-class standards. Each PR moves you up the ladder.",
    },
    {
      emoji: "📊",
      title: "Social Feed",
      description: "Share workouts, compete with friends, and react to each other's progress in real-time.",
    },
    {
      emoji: "🔥",
      title: "Streak System",
      description: "Build consistency with daily workout streaks. The longer your streak, the more rewards you earn.",
    },
  ];

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentStep("tutorial");
    }
  };

  const handleSkip = () => {
    setCurrentStep("tutorial");
  };

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
      <View style={{ gap: FR.space.x2 }}>
        <Text style={{ color: c.text, ...FR.type.h1 }}>Key Features</Text>
        <Text style={{ color: c.muted, ...FR.type.sub }}>A quick tour of what makes GymRats special</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(newIndex);
        }}
        style={{ flex: 1 }}
      >
        {features.map((feature, index) => (
          <View key={index} style={{ width: screenWidth - FR.space.x6 * 2, paddingHorizontal: FR.space.x3 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: FR.space.x6 }}>
              <Text style={{ fontSize: 64 }}>{feature.emoji}</Text>
              <View style={{ gap: FR.space.x3 }}>
                <Text style={{ color: c.text, ...FR.type.h2, textAlign: "center" }}>{feature.title}</Text>
                <Text style={{ color: c.muted, ...FR.type.body, textAlign: "center" }}>{feature.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: FR.space.x2 }}>
        {features.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === currentIndex ? c.text : c.muted,
            }}
          />
        ))}
      </View>

      <View style={{ gap: FR.space.x2 }}>
        <Pressable
          onPress={handleNext}
          accessibilityLabel={currentIndex < features.length - 1 ? "Next" : "Get Started"}
          accessibilityRole="button"
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>
            {currentIndex < features.length - 1 ? "Next" : "Get Started"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSkip}
          accessibilityLabel="Skip"
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Skip</Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentStep("personality")}
          accessibilityLabel="Back"
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TutorialStep() {
  const c = useThemeColors();
  const router = useRouter();
  const { setCurrentStep, completeOnboarding } = useOnboardingStore();

  const handleSkip = () => {
    // Mark tutorial as completed and go to complete step
    setCurrentStep("complete");
  };

  const startGuidedWorkout = () => {
    // Navigate to live-workout with tutorial mode
    router.push("/live-workout?tutorial=true");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: FR.space.x6, gap: FR.space.x6 }}>
      <Text style={{ color: c.text, ...FR.type.h1, textAlign: "center" }}>
        Ready to train?
      </Text>
      <Text style={{ color: c.muted, ...FR.type.body, textAlign: "center" }}>
        You're all set! Start a workout whenever you're ready. We'll guide you through your first session.
      </Text>

      <View style={{ gap: FR.space.x4 }}>
        <Pressable
          onPress={startGuidedWorkout}
          accessibilityLabel="Start guided workout"
          accessibilityRole="button"
          style={({ pressed }) => ({
            ...FR.pillButton({ card: c.card, border: c.border }),
            backgroundColor: c.text,
            paddingVertical: FR.space.x4,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Start Guided Workout</Text>
        </Pressable>
        <Pressable
          onPress={handleSkip}
          accessibilityLabel="Skip tutorial"
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Skip Tutorial</Text>
        </Pressable>
        <Pressable
          onPress={() => setCurrentStep("highlights")}
          accessibilityLabel="Back"
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CompletionStep() {
  const c = useThemeColors();
  const router = useRouter();

  // Navigate to home after a brief celebration
  useEffect(() => {
    setTimeout(() => {
      router.replace("/");
    }, 1500);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: FR.space.x4 }}>
      <Text style={{ fontSize: 64 }}>🎉</Text>
      <Text style={{ color: c.text, ...FR.type.h1 }}>You're ready!</Text>
      <ActivityIndicator size="large" color={c.text} />
    </View>
  );
}
