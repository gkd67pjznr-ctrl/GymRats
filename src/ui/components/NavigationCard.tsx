// src/ui/components/NavigationCard.tsx
// A reusable card component for navigation links

import { Pressable, Text, View } from "react-native";
import { Link, type Href } from "expo-router";
import { useThemeColors } from "@/src/ui/theme";

interface NavigationCardProps {
  href: string;
  title: string;
  subtitle: string;
  icon?: string;
}

export function NavigationCard({ href, title, subtitle, icon }: NavigationCardProps) {
  const c = useThemeColors();

  return (
    <Link href={href as Href} asChild>
      <Pressable
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 14,
          backgroundColor: c.card,
          gap: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && <Text style={{ fontSize: 18 }}>{icon}</Text>}
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{title}</Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>{subtitle}</Text>
          </View>
          <Text style={{ color: c.muted, fontSize: 16 }}>›</Text>
        </View>
      </Pressable>
    </Link>
  );
}