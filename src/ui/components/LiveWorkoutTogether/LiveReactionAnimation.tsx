import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { makeDesignSystem } from "../../ui/designSystem";

export interface LiveReactionAnimationProps {
  reaction: string;
  userName: string;
  onAnimationComplete: () => void;
  position?: 'left' | 'right' | 'center';
}

export function LiveReactionAnimation(props: LiveReactionAnimationProps) {
  const ds = makeDesignSystem("dark", "toxic");
  const { reaction, userName, onAnimationComplete, position = 'center' } = props;

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: position === 'left' ? -15 : position === 'right' ? 15 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Bounce back to normal scale
      Animated.spring(scale, {
        toValue: 1,
        friction: 12,
        tension: 60,
        useNativeDriver: true,
      }).start();

      // Wait then animate out
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.back(1.2)),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -30,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onAnimationComplete();
        });
      }, 1500);
    });

    // Cleanup
    return () => {
      opacity.setValue(0);
      scale.setValue(0.5);
      translateY.setValue(-50);
      rotate.setValue(0);
    };
  }, [reaction, userName, onAnimationComplete, position]);

  const positionStyles = {
    left: { alignSelf: 'flex-start', marginLeft: 20 },
    right: { alignSelf: 'flex-end', marginRight: 20 },
    center: { alignSelf: 'center' },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyles[position],
        {
          opacity,
          transform: [
            { scale },
            { translateY },
            { rotate: rotate.interpolate({
              inputRange: [-30, 30],
              outputRange: ['-30deg', '30deg']
            }) }
          ],
        }
      ]}
      pointerEvents="none"
    >
      <View style={styles.reactionContent}>
        <Text style={styles.reactionEmoji}>{reaction}</Text>
        {userName && (
          <View style={styles.userBadge}>
            <Text style={styles.userName} numberOfLines={1}>
              {userName}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2000,
    backgroundColor: 'transparent',
  },
  reactionContent: {
    alignItems: 'center',
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userBadge: {
    backgroundColor: 'rgba(17, 17, 24, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(38, 38, 58, 0.6)',
  },
  userName: {
    color: '#F2F4FF',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 100,
  },
});