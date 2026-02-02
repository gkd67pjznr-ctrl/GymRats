// src/ui/components/Social/PhotoAttachment.tsx
// Photo attachment picker and preview for social posts

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';

const MAX_PHOTOS = 4;

interface PhotoAttachmentProps {
  photos: string[];
  onAddPhotos: (uris: string[]) => void;
  onRemovePhoto: (uri: string) => void;
  disabled?: boolean;
}

export function PhotoAttachment({
  photos,
  onAddPhotos,
  onRemovePhoto,
  disabled = false,
}: PhotoAttachmentProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  const handlePickImage = async () => {
    if (disabled) return;
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Maximum photos', `You can only attach up to ${MAX_PHOTOS} photos.`);
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose a photo source',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openImagePicker,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        onAddPhotos([uri]);
      }
    } catch (error) {
      console.error('[PhotoAttachment] Camera error:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const openImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Photo library permission is required to select photos.');
        return;
      }

      const remainingSlots = MAX_PHOTOS - photos.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        onAddPhotos(uris);
      }
    } catch (error) {
      console.error('[PhotoAttachment] Image picker error:', error);
      Alert.alert('Error', 'Failed to select photo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.text }]}>Photos (optional)</Text>

      <View style={styles.photosGrid}>
        {photos.map((photoUri) => (
          <View key={photoUri} style={[styles.photoContainer, { borderColor: c.border }]}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: c.danger }]}
              onPress={() => onRemovePhoto(photoUri)}
              disabled={disabled}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < MAX_PHOTOS && (
          <Pressable
            onPress={handlePickImage}
            disabled={disabled}
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: c.bg,
                borderColor: c.border,
                opacity: pressed || disabled ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.addIcon, { color: ds.tone.accent }]}>+</Text>
            <Text style={[styles.addText, { color: c.muted }]}>Add Photo</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.helper, { color: c.muted }]}>
        {photos.length}/{MAX_PHOTOS} photos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addIcon: {
    fontSize: 32,
    fontWeight: '200',
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
  },
  helper: {
    fontSize: 12,
    fontWeight: '600',
  },
});
