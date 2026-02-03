// src/ui/components/WorkoutDrawer/index.tsx
// Main collapsible workout drawer component

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWorkoutDrawerStore, useDrawerPosition } from '@/src/lib/stores/workoutDrawerStore';
import { useCurrentSession } from '@/src/lib/stores/currentSessionStore';
import { useThemeColors } from '@/src/ui/theme';
import { DrawerEdge } from './DrawerEdge';
import { DrawerContent } from './DrawerContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Constants for drawer behavior
const EDGE_WIDTH = 24; // Width of visible edge when collapsed
const EXPANDED_WIDTH = SCREEN_WIDTH; // Full width when expanded
const COLLAPSED_POSITION = SCREEN_WIDTH - EDGE_WIDTH; // X position when collapsed
const EXPANDED_POSITION = 0; // X position when expanded

// Gesture thresholds
const SWIPE_VELOCITY_THRESHOLD = 500; // Fast swipe completes regardless of distance
const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen for slow swipes

// Spring config for smooth animations
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

/**
 * WorkoutDrawer Component
 *
 * A collapsible drawer that slides in from the right edge of the screen.
 * Contains the entire workout logging experience.
 *
 * States:
 * - closed: drawer not rendered (no active workout)
 * - collapsed: thin edge visible on right (~24px)
 * - expanded: full drawer open
 *
 * Gestures:
 * - Swipe right: collapse drawer
 * - Swipe left from edge: expand drawer
 * - Tap edge: expand drawer
 */
export function WorkoutDrawer() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const position = useDrawerPosition();
  const { setPosition, collapseDrawer, openDrawer, hasActiveWorkout } = useWorkoutDrawerStore();
  const currentSession = useCurrentSession();

  // Animated value for drawer X position
  const translateX = useSharedValue(SCREEN_WIDTH); // Start off-screen

  // Sync drawer state with currentSession on mount
  // If there's an existing session but drawer is closed, show collapsed edge
  useEffect(() => {
    const hasSession = !!currentSession && (currentSession.sets?.length > 0 || currentSession.exerciseBlocks?.length > 0);
    const store = useWorkoutDrawerStore.getState();

    if (hasSession && !store.hasActiveWorkout) {
      // Existing session detected on mount - set to collapsed
      useWorkoutDrawerStore.setState({
        hasActiveWorkout: true,
        position: 'collapsed'
      });
    }
  }, [currentSession]);

  // Sync animated value with store state
  useEffect(() => {
    if (position === 'closed') {
      translateX.value = withSpring(SCREEN_WIDTH, SPRING_CONFIG);
    } else if (position === 'collapsed') {
      translateX.value = withSpring(COLLAPSED_POSITION, SPRING_CONFIG);
    } else if (position === 'expanded') {
      translateX.value = withSpring(EXPANDED_POSITION, SPRING_CONFIG);
    }
  }, [position]);

  // Handle gesture end - determine final position based on velocity and distance
  const handleGestureEnd = (velocityX: number, currentX: number) => {
    'worklet';
    const isSwipingRight = velocityX > 0;
    const isSwipingLeft = velocityX < 0;
    const isFastSwipe = Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;

    // Fast swipe - complete in direction of swipe
    if (isFastSwipe) {
      if (isSwipingRight) {
        runOnJS(collapseDrawer)();
      } else if (isSwipingLeft) {
        runOnJS(openDrawer)();
      }
      return;
    }

    // Slow swipe - check distance threshold
    const distanceFromExpanded = currentX - EXPANDED_POSITION;
    const distanceFromCollapsed = COLLAPSED_POSITION - currentX;

    if (distanceFromExpanded > SWIPE_DISTANCE_THRESHOLD) {
      runOnJS(collapseDrawer)();
    } else {
      runOnJS(openDrawer)();
    }
  };

  // Pan gesture for dragging the drawer
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow dragging when drawer is expanded or collapsed (not closed)
      if (position === 'closed') return;

      // Calculate new position, clamped to valid range
      const newX = Math.max(
        EXPANDED_POSITION,
        Math.min(COLLAPSED_POSITION, translateX.value + event.translationX)
      );
      translateX.value = newX;
    })
    .onEnd((event) => {
      if (position === 'closed') return;
      handleGestureEnd(event.velocityX, translateX.value);
    });

  // Animated style for the drawer container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animated style for backdrop (optional dim when expanded)
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [COLLAPSED_POSITION, EXPANDED_POSITION],
      [0, 0.3],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: translateX.value < COLLAPSED_POSITION - 10 ? 'auto' : 'none',
    };
  });

  // Don't render if no active workout and no existing session
  const hasSession = !!currentSession && (currentSession.sets?.length > 0 || currentSession.exerciseBlocks?.length > 0);
  if (!hasActiveWorkout && !hasSession && position === 'closed') {
    return null;
  }

  return (
    <>
      {/* Backdrop (dims main content when drawer expanded) */}
      <Animated.View
        style={[
          styles.backdrop,
          { backgroundColor: '#000' },
          backdropStyle,
        ]}
        pointerEvents="none"
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={collapseDrawer}
        />
      </Animated.View>

      {/* Drawer Container */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: c.bg,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
            animatedStyle,
          ]}
        >
          {/* Edge indicator (visible when collapsed) */}
          <DrawerEdge
            isCollapsed={position === 'collapsed'}
            onPress={openDrawer}
          />

          {/* Main drawer content */}
          <DrawerContent />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default WorkoutDrawer;
