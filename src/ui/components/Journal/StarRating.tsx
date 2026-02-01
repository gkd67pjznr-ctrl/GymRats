// src/ui/components/Journal/StarRating.tsx
// 5-star rating selector for mood and energy

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";

export interface StarRatingProps {
  rating: number | undefined;
  onRatingChange: (rating: number) => void;
  size?: number;
  spacing?: number;
  disabled?: boolean;
  label?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 32,
  spacing = 8,
  disabled = false,
  label,
}) => {
  const colors = useThemeColors();

  const handlePress = (starIndex: number) => {
    if (disabled) return;
    const newRating = starIndex + 1;
    onRatingChange(newRating);
  };

  const renderStar = (index: number) => {
    const isFilled = rating !== undefined && index < rating;
    const starColor = isFilled ? colors.warning : colors.muted;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(index)}
        disabled={disabled}
        activeOpacity={0.7}
        style={{ marginRight: index < 4 ? spacing : 0 }}
      >
        <View style={[styles.starContainer, { width: size, height: size }]}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={starColor}
            stroke={starColor}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <span style={[styles.label, { color: colors.text }]}>{label}</span>
        </View>
      )}
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </View>
      {rating !== undefined && (
        <View style={styles.ratingTextContainer}>
          <span style={[styles.ratingText, { color: colors.muted }]}>
            {rating}/5
          </span>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  ratingTextContainer: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default StarRating;