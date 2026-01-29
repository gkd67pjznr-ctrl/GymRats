// app/onboarding.tsx
// Main onboarding screen with step routing

import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, TextInput } from "react-native";
import { useOnboardingStore, useCurrentOnboardingStep } from "../src/lib/stores/onboardingStore";
import { useThemeColors } from "../src/ui/theme";
import { FR } from "../src/ui/forgerankStyle";

export default function OnboardingScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const currentStep = useCurrentOnboardingStep();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
    case "profile":
      return <ProfileSetupStep />;
    case "personality":
      return <PersonalityPickerStep />;
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
    setCurrentStep("profile");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: FR.space.x6, gap: FR.space.x6 }}>
      <View style={{ gap: FR.space.x4, alignItems: "center" }}>
        <Text style={{ fontSize: 64 }}>💪</Text>
        <Text style={{ color: c.text, ...FR.type.h1, textAlign: "center" }}>
          Welcome to Forgerank
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

// Step 2: Profile Setup
function ProfileSetupStep() {
  const c = useThemeColors();
  const { setCurrentStep, setProfile } = useOnboardingStore();
  const [displayName, setDisplayName] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [experience, setExperience] = useState<"" | "beginner" | "intermediate" | "advanced">("");

  const handleNext = () => {
    if (!displayName.trim() || !bodyweight || !experience) {
      return; // TODO: Show validation error
    }

    // Convert to kg for storage
    const weightLb = unit === "kg" ? parseFloat(bodyweight) * 2.20462 : parseFloat(bodyweight);
    const weightKg = unit === "lb" ? parseFloat(bodyweight) / 2.20462 : parseFloat(bodyweight);

    setProfile({
      displayName: displayName.trim(),
      bodyweight: weightKg,
      bodyweightUnit: unit,
      experienceLevel: experience,
      personalityId: "coach", // default
    });
    setCurrentStep("personality");
  };

  const experienceOptions: Array<{ value: "beginner" | "intermediate" | "advanced"; label: string; years: string }> = [
    { value: "beginner", label: "Beginner", years: "0-1 years" },
    { value: "intermediate", label: "Intermediate", years: "1-3 years" },
    { value: "advanced", label: "Advanced", years: "3+ years" },
  ];

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
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
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={c.muted}
            style={{
              ...FR.card({ card: c.card, border: c.border }),
              color: c.text,
              ...FR.type.body,
              paddingVertical: FR.space.x3,
              paddingHorizontal: FR.space.x3,
              minHeight: 48,
            }}
            autoCapitalize="words"
          />
        </View>

        {/* Bodyweight input */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>Bodyweight</Text>
          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            <TextInput
              value={bodyweight}
              onChangeText={setBodyweight}
              placeholder="150"
              placeholderTextColor={c.muted}
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                ...FR.card({ card: c.card, border: c.border }),
                color: c.text,
                ...FR.type.body,
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x3,
                minHeight: 48,
              }}
            />
            <UnitToggle value={unit} onChange={setUnit} />
          </View>
        </View>

        {/* Experience level */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>Experience Level</Text>
          <View style={{ gap: FR.space.x2 }}>
            {experienceOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setExperience(option.value)}
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
        </View>
      </View>

      <View style={{ gap: FR.space.x2, marginTop: "auto" }}>
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
          onPress={() => setCurrentStep("welcome")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: c.muted, ...FR.type.sub, textAlign: "center" }}>Back</Text>
        </Pressable>
      </View>
    </View>
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

// Placeholder components for other steps (to be implemented)
function PersonalityPickerStep() {
  const c = useThemeColors();
  const { setCurrentStep, setPersonality } = useOnboardingStore();
  const [selected, setSelected] = useState("");

  const handleNext = () => {
    setPersonality(selected || "coach");
    setCurrentStep("tutorial");
  };

  return (
    <View style={{ flex: 1, padding: FR.space.x6, gap: FR.space.x6 }}>
      <Text style={{ color: c.text, ...FR.type.h1 }}>Pick your gym buddy</Text>
      <Text style={{ color: c.muted, ...FR.type.sub }}>Choose your personality. You can change this later.</Text>

      {/* Personality cards */}
      <View style={{ gap: FR.space.x3, flex: 1 }}>
        {["coach", "hype", "chill", "savage"].map((id) => {
          const personality = {
            coach: { emoji: "🏋️", name: "Coach", tagline: "Let's get to work." },
            hype: { emoji: "🔥", name: "Hype", tagline: "LET'S GOOO!" },
            chill: { emoji: "😌", name: "Chill", tagline: "You got this." },
            savage: { emoji: "💀", name: "Savage", tagline: "Is that all you got?" },
          }[id];

          return (
            <Pressable
              key={id}
              onPress={() => setSelected(id)}
              style={({ pressed }) => ({
                ...FR.card({ card: c.card, border: selected === id ? c.text : c.border }),
                padding: FR.space.x4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
                <Text style={{ fontSize: 32 }}>{personality.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{personality.name}</Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>{personality.tagline}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

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
    </View>
  );
}

function TutorialStep() {
  const c = useThemeColors();
  const { setCurrentStep, completeOnboarding } = useOnboardingStore();

  const handleSkip = () => {
    setCurrentStep("complete");
    completeOnboarding();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: FR.space.x6, gap: FR.space.x6 }}>
      <Text style={{ color: c.text, ...FR.type.h1, textAlign: "center" }}>
        Ready to train?
      </Text>
      <Text style={{ color: c.muted, ...FR.type.body, textAlign: "center" }}>
        You're all set! Start a workout whenever you're ready. We'll guide you through your first session.
      </Text>

      <Pressable
        onPress={handleSkip}
        style={({ pressed }) => ({
          ...FR.pillButton({ card: c.card, border: c.border }),
          backgroundColor: c.text,
          paddingVertical: FR.space.x4,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: c.bg, ...FR.type.h3, fontWeight: "900" }}>Get Started</Text>
      </Pressable>
    </View>
  );
}

function CompletionStep() {
  const c = useThemeColors();
  const router = useRouter();

  // Navigate to home after a brief celebration
  useState(() => {
    setTimeout(() => {
      router.replace("/");
    }, 1500);
  });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: FR.space.x4 }}>
      <Text style={{ fontSize: 64 }}>🎉</Text>
      <Text style={{ color: c.text, ...FR.type.h1 }}>You're ready!</Text>
      <ActivityIndicator size="large" color={c.text} />
    </View>
  );
}
