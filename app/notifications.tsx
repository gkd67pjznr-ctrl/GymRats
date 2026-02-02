// app/notifications.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../src/ui/theme";
import { setNotificationPref, useNotificationPrefs } from "../src/lib/notificationPrefs";

function Row(props: {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: () => void;
}) {
  const c = useThemeColors();

  return (
    <Pressable
      onPress={props.onToggle}
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 14,
        padding: 14,
        backgroundColor: c.card,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{props.title}</Text>
          <Text style={{ color: c.muted, lineHeight: 18 }}>{props.subtitle}</Text>
        </View>

        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: props.value ? c.text : c.border,
            backgroundColor: props.value ? c.bg : c.card,
            minWidth: 60,
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900" }}>{props.value ? "ON" : "OFF"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const c = useThemeColors();
  const prefs = useNotificationPrefs();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Notifications</Text>
      <Text style={{ color: c.muted, lineHeight: 18 }}>
        Toggle what can trigger notifications. (Push wiring comes later — these settings will still apply.)
      </Text>

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16, marginTop: 4 }}>Social</Text>

      <Row
        title="Likes & Reactions"
        subtitle="Notify me when someone reacts to my posted workout."
        value={prefs.reactions}
        onToggle={() => setNotificationPref("reactions", !prefs.reactions)}
      />

      <Row
        title="Comments"
        subtitle="Notify me when someone comments on my workout post."
        value={prefs.comments}
        onToggle={() => setNotificationPref("comments", !prefs.comments)}
      />

      <Row
        title="Friend Requests"
        subtitle="Notify me about new friend requests and acceptances."
        value={prefs.friendRequests}
        onToggle={() => setNotificationPref("friendRequests", !prefs.friendRequests)}
      />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16, marginTop: 6 }}>Chat</Text>

      <Row
        title="Messages"
        subtitle="Notify me when I receive a message."
        value={prefs.directMessages}
        onToggle={() => setNotificationPref("directMessages", !prefs.directMessages)}
      />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16, marginTop: 6 }}>Other</Text>

      <Row
        title="Store & Updates"
        subtitle="Optional: new emote bundles, feature updates, promos."
        value={prefs.marketing}
        onToggle={() => setNotificationPref("marketing", !prefs.marketing)}
      />

      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 14,
          backgroundColor: c.card,
          gap: 8,
          marginTop: 6,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "900" }}>Next</Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          Later we’ll wire real push notifications with Expo Notifications + backend events, and these toggles will
          control which ones fire.
        </Text>
      </View>
    </ScrollView>
  );
}
