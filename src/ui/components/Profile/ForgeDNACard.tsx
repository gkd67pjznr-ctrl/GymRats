import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";
import { useForgeDNAStore, useForgeDNA, useForgeDNALoading, useForgeDNAError } from "../../../lib/forgeDNA/store";
import { ForgeDNAVisualization } from "../ForgeDNA/ForgeDNAVisualization";
import { useUser } from "../../../lib/stores/authStore";

interface ForgeDNACardProps {
  onUpgradePress?: () => void;
}

export function ForgeDNACard(props: ForgeDNACardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const user = useUser();

  // DNA store hooks
  const dna = useForgeDNA();
  const isLoading = useForgeDNALoading();
  const error = useForgeDNAError();
  const generateDNA = useForgeDNAStore(state => state.generateDNA);

  // For demo purposes, assume free user
  const isPremium = false;

  // Generate DNA on component mount if not already generated
  useEffect(() => {
    if (user?.id && !dna && !isLoading) {
      generateDNA(user.id);
    }
  }, [user?.id, dna, isLoading, generateDNA]);

  // Regenerate DNA periodically or on user request
  const handleRefresh = () => {
    if (user?.id) {
      generateDNA(user.id);
    }
  };

  return (
    <View style={{
      backgroundColor: c.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: c.border,
    }}>
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <Text style={{
          color: c.text,
          fontSize: 20,
          fontWeight: "800",
        }}>
          Forge DNA
        </Text>

        <Pressable
          onPress={handleRefresh}
          disabled={isLoading}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: isLoading ? c.border : ds.tone.accent,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <Text style={{
            color: c.bg,
            fontSize: 12,
            fontWeight: "600",
          }}>
            {isLoading ? "Generating..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View style={{
          padding: 16,
          backgroundColor: `${ds.tone.danger}20`,
          borderRadius: 12,
          alignItems: "center",
        }}>
          <Text style={{
            color: ds.tone.danger,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 8,
          }}>
            {error}
          </Text>
          <Pressable
            onPress={handleRefresh}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: ds.tone.danger,
            }}
          >
            <Text style={{
              color: c.bg,
              fontSize: 12,
              fontWeight: "600",
            }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : dna ? (
        <ForgeDNAVisualization dna={dna} isPremium={isPremium} />
      ) : isLoading ? (
        <View style={{
          padding: 32,
          alignItems: "center",
        }}>
          <Text style={{
            color: c.muted,
            fontSize: 16,
          }}>
            Analyzing your training data...
          </Text>
        </View>
      ) : (
        <View style={{
          padding: 24,
          alignItems: "center",
          backgroundColor: `${ds.tone.accent}10`,
          borderRadius: 16,
        }}>
          <Text style={{
            color: c.text,
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            textAlign: "center",
          }}>
            Not Enough Data
          </Text>
          <Text style={{
            color: c.muted,
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: 16,
          }}>
            Complete at least 5 workouts to generate your Forge DNA
          </Text>
          <Pressable
            onPress={handleRefresh}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: ds.tone.accent,
            }}
          >
            <Text style={{
              color: c.bg,
              fontSize: 14,
              fontWeight: "600",
            }}>
              Check Again
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}