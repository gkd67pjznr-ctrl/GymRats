import { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";
import { useBuddyStore, useUnlockedBuddies, useCurrentBuddy } from "../../../lib/stores/buddyStore";
import { buddies } from "../../../lib/buddyData";
import type { Buddy } from "../../../lib/buddyTypes";

export function BuddySettingsScreen() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const currentBuddy = useCurrentBuddy();
  const unlockedBuddies = useUnlockedBuddies();
  const equipBuddy = useBuddyStore(state => state.equipBuddy);
  const unlockBuddy = useBuddyStore(state => state.unlockBuddy);
  const purchaseBuddy = useBuddyStore(state => state.purchaseBuddy);
  const forgeTokens = useBuddyStore(state => state.forgeTokens);

  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(currentBuddy);

  const handleEquipBuddy = (buddyId: string) => {
    if (equipBuddy(buddyId)) {
      const buddy = buddies.find(b => b.id === buddyId);
      if (buddy) {
        setSelectedBuddy(buddy);
        Alert.alert("Buddy Equipped", `${buddy.name} is now your active gym buddy!`);
      }
    } else {
      Alert.alert("Error", "Failed to equip buddy. Make sure the buddy is unlocked.");
    }
  };

  const handleUnlockBuddy = (buddy: Buddy) => {
    if (buddy.unlockMethod === 'forge_tokens' && buddy.unlockCost) {
      if (unlockBuddy(buddy.id)) {
        Alert.alert("Buddy Unlocked", `${buddy.name} has been unlocked with ${buddy.unlockCost} Forge Tokens!`);
      } else {
        Alert.alert("Not Enough Tokens", `You need ${buddy.unlockCost} Forge Tokens to unlock ${buddy.name}.`);
      }
    } else if (buddy.unlockMethod === 'iap') {
      // In a real app, this would trigger the IAP flow
      Alert.alert(
        "Purchase Required",
        `${buddy.name} requires an in-app purchase to unlock.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Purchase",
            onPress: () => {
              if (purchaseBuddy(buddy.id)) {
                Alert.alert("Purchase Complete", `${buddy.name} has been unlocked!`);
              } else {
                Alert.alert("Purchase Failed", "Failed to complete the purchase. Please try again.");
              }
            }
          }
        ]
      );
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return ds.tone.purple;
      case 'legendary': return ds.tone.gold;
      default: return ds.tone.text;
    }
  };

  const isBuddyUnlocked = (buddyId: string) => {
    return unlockedBuddies.some(b => b.id === buddyId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
      <Text style={{
        color: c.text,
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
      }}>
        AI Gym Buddies
      </Text>

      <Text style={{
        color: c.muted,
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
      }}>
        Choose your gym companion. Each buddy has a unique personality and reacts differently to your workout.
      </Text>

      {/* Current Buddy */}
      {currentBuddy && (
        <View style={{
          backgroundColor: c.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: ds.tone.accent,
        }}>
          <Text style={{
            color: c.muted,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
          }}>
            CURRENT BUDDY
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{
              color: c.text,
              fontSize: 24,
              fontWeight: "800",
              flex: 1,
            }}>
              {currentBuddy.name}
            </Text>
            <View style={{
              backgroundColor: getTierColor(currentBuddy.tier),
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}>
              <Text style={{
                color: c.bg,
                fontSize: 12,
                fontWeight: "700",
                textTransform: "uppercase",
              }}>
                {currentBuddy.tier}
              </Text>
            </View>
          </View>

          <Text style={{
            color: c.muted,
            fontSize: 16,
            marginBottom: 16,
            lineHeight: 22,
          }}>
            {currentBuddy.description}
          </Text>

          <Text style={{
            color: c.text,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
          }}>
            Sample Lines:
          </Text>

          {currentBuddy.previewLines.slice(0, 2).map((line, index) => (
            <Text key={index} style={{
              color: c.muted,
              fontSize: 14,
              fontStyle: "italic",
              marginBottom: 4,
            }}>
              "{line}"
            </Text>
          ))}

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: c.border,
          }}>
            <Text style={{
              color: c.text,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}>
              {forgeTokens} Forge Tokens
            </Text>
            {currentBuddy.tier === 'basic' && currentBuddy.unlockMethod === 'forge_tokens' && (
              <Text style={{
                color: ds.tone.accent,
                fontSize: 14,
                fontWeight: "600",
              }}>
                {currentBuddy.unlockCost} to unlock
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Buddy List */}
      <Text style={{
        color: c.text,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
      }}>
        All Buddies
      </Text>

      {buddies.map((buddy) => {
        const unlocked = isBuddyUnlocked(buddy.id);
        const isCurrent = currentBuddy?.id === buddy.id;

        return (
          <View
            key={buddy.id}
            style={{
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              opacity: unlocked ? 1 : 0.7,
              borderWidth: isCurrent ? 2 : 1,
              borderColor: isCurrent ? ds.tone.accent : c.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{
                    color: c.text,
                    fontSize: 18,
                    fontWeight: "700",
                    marginRight: 8,
                  }}>
                    {buddy.name}
                  </Text>
                  <View style={{
                    backgroundColor: getTierColor(buddy.tier),
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}>
                    <Text style={{
                      color: c.bg,
                      fontSize: 10,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}>
                      {buddy.tier}
                    </Text>
                  </View>
                </View>

                <Text style={{
                  color: c.muted,
                  fontSize: 14,
                }}>
                  {buddy.archetype}
                </Text>
              </View>
            </View>

            <Text style={{
              color: c.muted,
              fontSize: 14,
              marginBottom: 12,
              lineHeight: 20,
            }}>
              {buddy.description}
            </Text>

            <Text style={{
              color: c.text,
              fontSize: 13,
              fontWeight: "600",
              marginBottom: 6,
            }}>
              Sample Lines:
            </Text>

            {buddy.previewLines.slice(0, 2).map((line, index) => (
              <Text key={index} style={{
                color: c.muted,
                fontSize: 13,
                fontStyle: "italic",
                marginBottom: 3,
              }}>
                "{line}"
              </Text>
            ))}

            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 16,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: c.border,
            }}>
              {unlocked ? (
                <Pressable
                  onPress={() => handleEquipBuddy(buddy.id)}
                  style={{
                    backgroundColor: isCurrent ? c.border : ds.tone.accent,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text style={{
                    color: isCurrent ? c.text : c.bg,
                    fontSize: 14,
                    fontWeight: "700",
                  }}>
                    {isCurrent ? "CURRENT" : "EQUIP"}
                  </Text>
                </Pressable>
              ) : (
                <View style={{ flex: 1 }}>
                  {buddy.unlockMethod === 'free' ? (
                    <Text style={{
                      color: c.muted,
                      fontSize: 14,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}>
                      Unlocked by default
                    </Text>
                  ) : buddy.unlockMethod === 'forge_tokens' ? (
                    <Pressable
                      onPress={() => handleUnlockBuddy(buddy)}
                      style={{
                        backgroundColor: ds.tone.accent,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{
                        color: c.bg,
                        fontSize: 14,
                        fontWeight: "700",
                      }}>
                        Unlock with {buddy.unlockCost} Tokens
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleUnlockBuddy(buddy)}
                      style={{
                        backgroundColor: ds.tone.purple,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{
                        color: c.bg,
                        fontSize: 14,
                        fontWeight: "700",
                      }}>
                        Purchase IAP
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}