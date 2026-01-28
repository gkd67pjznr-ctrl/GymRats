// src/lib/supabase/storage.ts
// Supabase Storage utilities for image uploads (avatars, post photos)

import * as FileSystem from "expo-file-system";
import { supabase } from "./client";
import { logError } from "../errorHandler";

// ============================================================================
// Types
// ============================================================================

/**
 * Image upload result
 */
export interface ImageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeBytes?: number;
  compress?: boolean;
  quality?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default storage bucket names
 */
export const BUCKETS = {
  AVATARS: "avatars",
  POSTS: "posts",
} as const;

/**
 * Default upload limits
 */
export const UPLOAD_LIMITS = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  QUALITY: 0.8,
} as const;

// ============================================================================
// Functions
// ============================================================================

/**
 * Upload an image to Supabase Storage
 *
 * @param fileUri Local URI of the image file
 * @param fileName Name to give the file in storage
 * @param userId User ID for folder organization
 * @param options Upload options
 * @returns Upload result with public URL
 */
export async function uploadImage(
  fileUri: string,
  fileName: string,
  userId: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const {
    bucket = BUCKETS.POSTS,
    folder = "images",
    maxSizeBytes = UPLOAD_LIMITS.MAX_SIZE_BYTES,
    compress = true,
    quality = UPLOAD_LIMITS.QUALITY,
  } = options;

  try {
    // Read file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return { success: false, error: "File does not exist" };
    }

    // Check file size
    if (fileInfo.size && fileInfo.size > maxSizeBytes) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`,
      };
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });

    // Create unique file path
    const timestamp = Date.now();
    const ext = fileName.split(".").pop() || "jpg";
    const filePath = `${userId}/${folder}/${timestamp}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(`data:image/${ext};base64,${base64}`), {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) {
      logError({ context: "Storage.uploadImage", error, userMessage: "Failed to upload image" });
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    logError({ context: "Storage.uploadImage", error: err, userMessage: "Failed to upload image" });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 *
 * @param path Path to the file in storage
 * @param bucket Bucket name
 * @returns Success status
 */
export async function deleteImage(
  path: string,
  bucket: string = BUCKETS.POSTS
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      logError({ context: "Storage.deleteImage", error, userMessage: "Failed to delete image" });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    logError({ context: "Storage.deleteImage", error: err, userMessage: "Failed to delete image" });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Upload a user avatar
 *
 * @param fileUri Local URI of the avatar image
 * @param userId User ID
 * @returns Upload result
 */
export async function uploadAvatar(
  fileUri: string,
  userId: string
): Promise<ImageUploadResult> {
  return uploadImage(fileUri, `avatar.jpg`, userId, {
    bucket: BUCKETS.AVATARS,
    folder: "",
    maxSizeBytes: 2 * 1024 * 1024, // 2MB for avatars
    quality: 0.9,
  });
}

/**
 * Upload a post photo
 *
 * @param fileUri Local URI of the post image
 * @param userId User ID
 * @returns Upload result
 */
export async function uploadPostPhoto(
  fileUri: string,
  userId: string
): Promise<ImageUploadResult> {
  return uploadImage(fileUri, `photo.jpg`, userId, {
    bucket: BUCKETS.POSTS,
    folder: "posts",
    maxSizeBytes: 5 * 1024 * 1024, // 5MB for post photos
    quality: 0.85,
  });
}

/**
 * Generate a unique avatar placeholder URL based on user ID
 * Uses a consistent avatar service
 *
 * @param userId User ID
 * @param displayName Optional display name for initials
 * @returns Avatar URL
 */
export function generateAvatarUrl(userId: string, displayName?: string): string {
  // Using DiceBear API for consistent avatars
  const seed = displayName || userId;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4ECDC4`;
}

// ============================================================================
// Helper
// ============================================================================

/**
 * Decode base64 data URI to binary
 */
function decode(dataUri: string): Blob {
  const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid data URI");
  }

  const mime = matches[1];
  const base64 = matches[2];

  // Convert base64 to binary string
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}
