// Body Model Demo Screen
import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { BodyModel } from '@/src/ui/components/BodyModel';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import { useColorScheme } from 'react-native';
import { useSettings } from '@/src/lib/stores/settingsStore';
import { TabErrorBoundary } from '@/src/ui/tab-error-boundary';

const useDesignSystem = () => {
  const { accent } = useSettings();
  const colorScheme = useColorScheme();
  return makeDesignSystem(colorScheme === 'dark' ? 'dark' : 'light', accent);
};

export default function BodyModelDemoScreen() {
  const ds = useDesignSystem();
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [sampleData, setSampleData] = useState<'balanced' | 'chest-focused' | 'legs-focused'>('balanced');

  // Sample muscle volume data for different scenarios
  const getSampleVolumes = () => {
    switch (sampleData) {
      case 'chest-focused':
        return {
          'chest': 1.0,
          'shoulders': 0.8,
          'triceps': 0.7,
          'quadriceps': 0.3,
          'hamstrings': 0.2,
        };
      case 'legs-focused':
        return {
          'quadriceps': 1.0,
          'hamstrings': 0.9,
          'glutes': 0.8,
          'calves': 0.7,
          'chest': 0.2,
          'shoulders': 0.1,
        };
      case 'balanced':
      default:
        return {
          'chest': 0.8,
          'shoulders': 0.7,
          'quadriceps': 0.9,
          'hamstrings': 0.8,
          'glutes': 0.7,
          'lats': 0.6,
          'lower back': 0.5,
          'triceps': 0.6,
          'biceps': 0.5,
        };
    }
  };

  const muscleVolumes = getSampleVolumes();

  return (
    <TabErrorBoundary screenName="Body Model Demo">
      <ScrollView
        style={{ flex: 1, backgroundColor: ds.tone.bg }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <Text style={{ color: ds.tone.text, fontSize: 26, fontWeight: "900" }}>
          Body Model Demo
        </Text>
        <Text style={{ color: ds.tone.muted, lineHeight: 18 }}>
          Interactive demonstration of the muscle heatmap visualization.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: ds.tone.border,
            borderRadius: 16,
            padding: 12,
            backgroundColor: ds.tone.card,
            gap: 12,
          }}
        >
          <Text style={{ color: ds.tone.text, fontWeight: "900", fontSize: 16 }}>
            Sample Data Presets
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => setSampleData('balanced')}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: sampleData === 'balanced' ? alpha(ds.tone.accent, 0.2) : ds.tone.card2,
                borderWidth: 1,
                borderColor: sampleData === 'balanced' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{ color: sampleData === 'balanced' ? ds.tone.accent : ds.tone.text }}>
                Balanced
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSampleData('chest-focused')}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: sampleData === 'chest-focused' ? alpha(ds.tone.accent, 0.2) : ds.tone.card2,
                borderWidth: 1,
                borderColor: sampleData === 'chest-focused' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{ color: sampleData === 'chest-focused' ? ds.tone.accent : ds.tone.text }}>
                Chest Focused
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSampleData('legs-focused')}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: sampleData === 'legs-focused' ? alpha(ds.tone.accent, 0.2) : ds.tone.card2,
                borderWidth: 1,
                borderColor: sampleData === 'legs-focused' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{ color: sampleData === 'legs-focused' ? ds.tone.accent : ds.tone.text }}>
                Legs Focused
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: ds.tone.text, fontWeight: "900", fontSize: 16 }}>
              Muscle Map
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => setViewSide('front')}>
                <Text style={{ color: viewSide === 'front' ? ds.tone.accent : ds.tone.muted, fontWeight: 'bold' }}>Front</Text>
              </Pressable>
              <Pressable onPress={() => setViewSide('back')}>
                <Text style={{ color: viewSide === 'back' ? ds.tone.accent : ds.tone.muted, fontWeight: 'bold' }}>Back</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <BodyModel muscleVolumes={muscleVolumes} side={viewSide} />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: ds.tone.text, fontWeight: "900", fontSize: 16 }}>
              Volume Data
            </Text>
            {Object.entries(muscleVolumes).map(([muscle, volume]) => (
              <View key={muscle} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: ds.tone.text }}>{muscle}</Text>
                <Text style={{ color: ds.tone.text }}>{(volume * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </TabErrorBoundary>
  );
}