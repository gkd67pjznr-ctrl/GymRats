/**
 * Gym DNA Card - Training fingerprint visualization
 * Renamed from Forge DNA
 */
import * as React from "react";
import { useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import {
  useForgeDNAStore,
  useForgeDNA,
  useForgeDNALoading,
  useForgeDNAError,
  useForgeDNAHistory,
  useForgeDNAHistoryLoading,
  useLoadDNAHistory,
  useIsSharing,
  useShareError,
  useShareDNA,
  useIsSyncing,
  useSyncError,
  useLastSynced,
  useSyncWithServer,
  useAverageUserDNA,
  useComparisonLoading,
  useLoadUserComparison
} from "@/src/lib/forgeDNA/store";
import { ForgeDNAVisualization } from "../ForgeDNA/ForgeDNAVisualization";
import { ShareButton } from "../ForgeDNA/ShareButton";
import { useUser } from "@/src/lib/stores/authStore";
import { useIsPremiumUser } from "@/src/lib/hooks/useIsPremiumUser";

interface GymDNACardProps {
  onUpgradePress?: () => void;
}

export function GymDNACard(props: GymDNACardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const user = useUser();

  // DNA store hooks
  const dna = useForgeDNA();
  const isLoading = useForgeDNALoading();
  const error = useForgeDNAError();
  const generateDNA = useForgeDNAStore(state => state.generateDNA);

  // Sharing hooks
  const isSharing = useIsSharing();
  const shareError = useShareError();
  const shareDNA = useShareDNA();

  // Sync hooks
  const isSyncing = useIsSyncing();
  const syncError = useSyncError();
  const lastSynced = useLastSynced();
  const syncWithServer = useSyncWithServer();

  // Check if user has premium access
  const isPremium = useIsPremiumUser();

  // Generate DNA on component mount if not already generated
  useEffect(() => {
    if (user?.id && !dna && !isLoading) {
      generateDNA(user.id);
    }
  }, [user?.id, dna, isLoading, generateDNA]);

  // Load DNA history on component mount for premium users
  const history = useForgeDNAHistory();
  const isHistoryLoading = useForgeDNAHistoryLoading();
  const loadDNAHistory = useLoadDNAHistory();

  useEffect(() => {
    if (user?.id && isPremium && !history && !isHistoryLoading) {
      loadDNAHistory(user.id);
    }
  }, [user?.id, isPremium, history, isHistoryLoading, loadDNAHistory]);

  // Load user comparison data for premium users
  const averageUserDNA = useAverageUserDNA();
  const isComparisonLoading = useComparisonLoading();
  const loadUserComparison = useLoadUserComparison();

  useEffect(() => {
    if (user?.id && isPremium && !averageUserDNA && !isComparisonLoading) {
      loadUserComparison(user.id);
    }
  }, [user?.id, isPremium, averageUserDNA, isComparisonLoading, loadUserComparison]);

  // Handle sharing DNA to feed
  const handleShare = async (caption: string, privacy: 'public' | 'friends') => {
    if (user?.id) {
      await shareDNA(user.id, caption, privacy);
    }
  };

  // Handle syncing with server
  const handleSync = async () => {
    if (user?.id) {
      await syncWithServer(user.id);
    }
  };

  // Regenerate DNA periodically or on user request
  const handleRefresh = () => {
    if (user?.id) {
      generateDNA(user.id);
    }
  };

  // Sync with server when component mounts
  React.useEffect(() => {
    if (user?.id && isPremium) {
      handleSync();
    }
  }, [user?.id, isPremium]);

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
          DNA
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {isPremium && dna && (
            <ShareButton
              onShare={handleShare}
              isSharing={isSharing}
              shareError={shareError}
            />
          )}

          <Pressable
            onPress={handleSync}
            disabled={isSyncing}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: isSyncing ? c.border : ds.tone.accent,
              opacity: isSyncing ? 0.5 : 1,
            }}
          >
            <Text style={{
              color: c.bg,
              fontSize: 12,
              fontWeight: "600",
            }}>
              {isSyncing ? "Syncing..." : "Sync"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRefresh}
            disabled={isLoading || isSharing || isSyncing}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: (isLoading || isSharing || isSyncing) ? c.border : ds.tone.accent,
              opacity: (isLoading || isSharing || isSyncing) ? 0.5 : 1,
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
        <ForgeDNAVisualization
          dna={dna}
          isPremium={isPremium}
          history={history || []}
          averageUserDNA={averageUserDNA || undefined}
        />
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
            Complete at least 5 workouts to generate your Gym DNA
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
