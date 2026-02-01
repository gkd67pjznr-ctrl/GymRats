import { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../../ui/theme";
import { useBuddyStore, useUnlockedBuddies, useCurrentBuddy } from "../../../lib/stores/buddyStore";
import { buddies } from "../../../lib/buddyData";
import type { Buddy } from "../../../lib/buddyTypes";
import { VoiceManager } from "../../../lib/voice/VoiceManager";

export function BuddySettingsScreen() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const currentBuddy = useCurrentBuddy();
  const unlockedBuddies = useUnlockedBuddies();
  const equipBuddy = useBuddyStore(state => state.equipBuddy);
  const unlockBuddy = useBuddyStore(state => state.unlockBuddy);
  const purchaseBuddy = useBuddyStore(state => state.purchaseBuddy);
  const getProductInfo = useBuddyStore(state => state.getProductInfo);
  const restorePurchases = useBuddyStore(state => state.restorePurchases);
  const forgeTokens = useBuddyStore(state => state.forgeTokens);

  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(currentBuddy);
  const [purchasingBuddyId, setPurchasingBuddyId] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<Record<string, { title: string; price: string; currency: string; localizedPrice: string }>>({});
  const [restoringPurchases, setRestoringPurchases] = useState(false);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  // Fetch product info for IAP buddies on mount
  useEffect(() => {
    const fetchProductInfo = async () => {
      const iapBuddies = buddies.filter(b => b.unlockMethod === 'iap');
      const info: Record<string, any> = {};

      for (const buddy of iapBuddies) {
        const product = await getProductInfo(buddy.id);
        if (product) {
          info[buddy.id] = product;
        }
      }

      setProductInfo(info);
    };

    fetchProductInfo();
  }, [getProductInfo]);

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

  const handleUnlockBuddy = async (buddy: Buddy) => {
    if (buddy.unlockMethod === 'forge_tokens' && buddy.unlockCost) {
      if (unlockBuddy(buddy.id)) {
        Alert.alert("Buddy Unlocked", `${buddy.name} has been unlocked with ${buddy.unlockCost} Forge Tokens!`);
      } else {
        Alert.alert("Not Enough Tokens", `You need ${buddy.unlockCost} Forge Tokens to unlock ${buddy.name}.`);
      }
    } else if (buddy.unlockMethod === 'iap') {
      // Show purchase confirmation with price info
      const product = productInfo[buddy.id];
      const priceText = product ? ` for ${product.localizedPrice}` : '';

      Alert.alert(
        "Purchase Buddy",
        `Unlock ${buddy.name}${priceText}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: `Purchase${priceText ? ` ${product.localizedPrice}` : ''}`,
            onPress: async () => {
              setPurchasingBuddyId(buddy.id);
              try {
                const success = await purchaseBuddy(buddy.id);
                if (success) {
                  // Purchase initiated successfully - actual unlock happens via callback
                  Alert.alert(
                    "Purchase Started",
                    `Purchase of ${buddy.name} has been initiated. You'll be notified when it completes.`
                  );
                } else {
                  Alert.alert("Purchase Failed", "Failed to start the purchase. Please try again.");
                }
              } catch (error) {
                console.error(`Failed to purchase buddy ${buddy.id}:`, error);
                Alert.alert("Purchase Error", "An error occurred during purchase. Please try again.");
              } finally {
                setPurchasingBuddyId(null);
              }
            }
          }
        ]
      );
    }
  };

  const handleRestorePurchases = async () => {
    setRestoringPurchases(true);
    try {
      await restorePurchases();
      Alert.alert("Purchases Restored", "Your previous purchases have been restored.");
    } catch (error) {
      console.error("Failed to restore purchases:", error);
      Alert.alert("Restore Failed", "Failed to restore purchases. Please try again.");
    } finally {
      setRestoringPurchases(false);
    }
  };

  const handlePlayPreview = async (buddyId: string) => {
    if (playingPreviewId) {
      // Stop currently playing preview
      VoiceManager.stopAll();
      setPlayingPreviewId(null);
      return;
    }

    // Ensure VoiceManager is initialized
    try {
      await VoiceManager.initialize();
    } catch (error) {
      console.warn('[BuddySettingsScreen] VoiceManager initialization failed:', error);
    }

    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy) return;

    // Check if buddy has preview voice
    if (!buddy.previewVoice) {
      // Fallback: try to get a voice line from voiceLines
      const voiceLines = buddy.voiceLines;
      if (voiceLines) {
        // Pick first available voice line
        const triggerTypes = Object.keys(voiceLines) as Array<keyof typeof voiceLines>;
        if (triggerTypes.length > 0) {
          const firstTrigger = triggerTypes[0];
          const lines = voiceLines[firstTrigger];
          if (lines && lines.length > 0) {
            setPlayingPreviewId(buddyId);
            try {
              await VoiceManager.play(lines[0]);
            } catch (error) {
              console.error(`Failed to play preview for ${buddyId}:`, error);
              Alert.alert("Playback Error", "Could not play voice preview.");
            } finally {
              setPlayingPreviewId(null);
            }
            return;
          }
        }
      }
      // No voice lines available
      Alert.alert("No Preview", "This buddy doesn't have a voice preview yet.");
      return;
    }

    setPlayingPreviewId(buddyId);
    try {
      await VoiceManager.play(buddy.previewVoice);
    } catch (error) {
      console.error(`Failed to play preview for ${buddyId}:`, error);
      Alert.alert("Playback Error", "Could not play voice preview.");
    } finally {
      setPlayingPreviewId(null);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return ds.tone.accent2;
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
        const product = productInfo[buddy.id];
        const isPurchasing = purchasingBuddyId === buddy.id;

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

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{
                color: c.text,
                fontSize: 13,
                fontWeight: "600",
              }}>
                Sample Lines:
              </Text>
              {(buddy.tier === 'premium' || buddy.tier === 'legendary') && (
                <Pressable
                  onPress={() => handlePlayPreview(buddy.id)}
                  disabled={playingPreviewId === buddy.id}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: playingPreviewId === buddy.id ? ds.tone.accent2 : c.border,
                  }}
                >
                  <Text style={{ color: c.text, fontSize: 12, fontWeight: "700" }}>
                    {playingPreviewId === buddy.id ? "⏹ Stop" : "▶ Preview Voice"}
                  </Text>
                </Pressable>
              )}
            </View>

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
                      disabled={isPurchasing}
                      style={{
                        backgroundColor: ds.tone.accent2,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        alignItems: "center",
                        opacity: isPurchasing ? 0.7 : 1,
                      }}
                    >
                      {isPurchasing ? (
                        <ActivityIndicator size="small" color={c.bg} />
                      ) : (
                        <Text style={{
                          color: c.bg,
                          fontSize: 14,
                          fontWeight: "700",
                        }}>
                          {product?.localizedPrice ? `Purchase ${product.localizedPrice}` : 'Purchase IAP'}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Restore Purchases */}
      <Pressable
        onPress={handleRestorePurchases}
        disabled={restoringPurchases}
        style={{
          backgroundColor: c.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "center",
          marginTop: 24,
          marginBottom: 32,
          opacity: restoringPurchases ? 0.7 : 1,
        }}
      >
        {restoringPurchases ? (
          <ActivityIndicator size="small" color={c.text} />
        ) : (
          <Text style={{
            color: c.text,
            fontSize: 14,
            fontWeight: "600",
          }}>
            Restore Previous Purchases
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}