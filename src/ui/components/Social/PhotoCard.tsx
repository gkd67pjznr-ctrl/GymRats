// src/ui/components/Social/PhotoCard.tsx
// Display photos attached to social posts

import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { useThemeColors } from '@/src/ui/theme';
import { FR } from '@/src/ui/forgerankStyle';
import { makeDesignSystem } from '@/src/ui/designSystem';

interface PhotoCardProps {
  photoUrls: string[];
  maxPreview?: number;
}

export function PhotoCard({ photoUrls, maxPreview = 3 }: PhotoCardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!photoUrls || photoUrls.length === 0) {
    return null;
  }

  const displayPhotos = photoUrls.slice(0, maxPreview);
  const remainingCount = photoUrls.length - maxPreview;

  const getGridStyle = () => {
    if (photoUrls.length === 1) {
      return [styles.singlePhoto, { width: '100%', aspectRatio: 4 / 3 }];
    }
    if (photoUrls.length === 2) {
      return [styles.photo, { width: '48%', aspectRatio: 1 }];
    }
    return [styles.photo, { width: '31%', aspectRatio: 1 }];
  };

  return (
    <>
      <View style={[styles.container, { gap: FR.space.x2 }]}>
        {displayPhotos.map((uri, index) => (
          <Pressable
            key={`${uri}-${index}`}
            onPress={() => setFullscreenImage(uri)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View style={[styles.photoContainer, { borderColor: c.border }]}>
              <Image source={{ uri }} style={getGridStyle()} />
              {index === maxPreview - 1 && remainingCount > 0 && (
                <View
                  style={[
                    styles.moreIndicator,
                    { backgroundColor: 'rgba(0,0,0,0.6)' },
                  ]}
                >
                  <FR.h3 style={{ color: '#fff' }}>+{remainingCount}</FR.h3>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={fullscreenImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
      >
        <Pressable
          style={styles.fullscreenOverlay}
          onPress={() => setFullscreenImage(null)}
        >
          {fullscreenImage && (
            <Image
              source={{ uri: fullscreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  singlePhoto: {
    borderRadius: 12,
  },
  photo: {
    borderRadius: 8,
  },
  moreIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
