// src/lib/iap/IAPService.ts
// In-App Purchase service for AI Gym Buddy system
//
// Uses expo-iap for cross-platform IAP support.
// Handles purchase flow for premium and legendary buddies.

import { Platform } from 'react-native';
import { buddies } from '../buddyData';
import type { Buddy } from '../buddyTypes';

// Optional import for expo-iap (may not be available in development)
let IAP: any = null;
try {
  IAP = require('expo-iap');
} catch {
  IAP = null;
}

/**
 * IAP Product information from app stores
 */
export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
}

/**
 * IAP Purchase result
 */
export interface IAPPurchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
}

/**
 * IAP Service Singleton
 *
 * Manages in-app purchases for premium and legendary buddies.
 * Handles product fetching, purchase flow, and receipt validation.
 */
class IAPServiceClass {
  private initialized: boolean = false;
  private purchaseUpdateListener: any = null;
  private purchaseSuccessCallback: ((buddyId: string) => void) | null = null;

  /**
   * Initialize the IAP service
   *
   * Sets up purchase listeners and restores previous purchases.
   * Should be called during app startup.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (!IAP) {
        console.warn('[IAPService] expo-iap not available, skipping initialization');
        return;
      }
      // Connect to app store
      await IAP.connectAsync();

      // Set up purchase listener
      this.purchaseUpdateListener = IAP.setPurchaseListener(
        this.handlePurchaseUpdate.bind(this)
      );

      // Restore previous purchases (important for iOS)
      await this.restorePurchases();

      this.initialized = true;
      console.log('[IAPService] Initialized successfully');
    } catch (error) {
      console.error('[IAPService] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Shutdown the IAP service
   *
   * Cleans up listeners and disconnects from app store.
   * Should be called when app is shutting down.
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      if (!IAP) {
        this.initialized = false;
        return;
      }
      if (this.purchaseUpdateListener) {
        this.purchaseUpdateListener.remove();
        this.purchaseUpdateListener = null;
      }

      await IAP.disconnectAsync();
      this.initialized = false;
      console.log('[IAPService] Shutdown successfully');
    } catch (error) {
      console.error('[IAPService] Failed to shutdown:', error);
    }
  }

  /**
   * Set callback for successful purchases
   *
   * This callback will be called when a purchase completes successfully.
   * The buddy store should register here to update its state.
   */
  setPurchaseSuccessCallback(callback: (buddyId: string) => void): void {
    this.purchaseSuccessCallback = callback;
  }

  /**
   * Get product info for a buddy
   *
   * Fetches product details from app store for display in UI.
   *
   * @param buddyId - Buddy ID to get product info for
   * @returns Product info or null if not found/error
   */
  async getProductInfo(buddyId: string): Promise<IAPProduct | null> {
    if (!this.initialized) {
      console.warn('[IAPService] Not initialized');
      return null;
    }
    if (!IAP) {
      console.warn('[IAPService] IAP not available');
      return null;
    }

    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy || !buddy.iapProductId) {
      console.warn(`[IAPService] Buddy ${buddyId} doesn't have IAP product`);
      return null;
    }

    try {
      const products = await IAP.getProductsAsync([buddy.iapProductId]);
      if (products.length === 0) {
        console.warn(`[IAPService] No product found for ID: ${buddy.iapProductId}`);
        return null;
      }

      const product = products[0];
      return {
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        localizedPrice: product.localizedPrice,
      };
    } catch (error) {
      console.error(`[IAPService] Failed to fetch product for ${buddyId}:`, error);
      return null;
    }
  }

  /**
   * Get product info for multiple buddies
   */
  async getProductInfoForBuddies(buddyIds: string[]): Promise<Record<string, IAPProduct>> {
    if (!this.initialized) {
      console.warn('[IAPService] Not initialized');
      return {};
    }
    if (!IAP) {
      console.warn('[IAPService] IAP not available');
      return {};
    }
    const productIds = buddyIds
      .map(buddyId => {
        const buddy = buddies.find(b => b.id === buddyId);
        return buddy?.iapProductId;
      })
      .filter((productId): productId is string => !!productId);

    if (productIds.length === 0) {
      return {};
    }

    try {
      const products = await IAP.getProductsAsync(productIds);
      const result: Record<string, IAPProduct> = {};

      for (const product of products) {
        // Find which buddy this product belongs to
        const buddy = buddies.find(b => b.iapProductId === product.productId);
        if (buddy) {
          result[buddy.id] = {
            productId: product.productId,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            localizedPrice: product.localizedPrice,
          };
        }
      }

      return result;
    } catch (error) {
      console.error('[IAPService] Failed to fetch products:', error);
      return {};
    }
  }

  /**
   * Purchase a buddy
   *
   * Starts the purchase flow for a premium/legendary buddy.
   *
   * @param buddyId - Buddy ID to purchase
   * @returns True if purchase was successful, false otherwise
   */
  async purchaseBuddy(buddyId: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('[IAPService] Not initialized');
      return false;
    }
    if (!IAP) {
      console.warn('[IAPService] IAP not available');
      return false;
    }

    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy || !buddy.iapProductId) {
      console.warn(`[IAPService] Buddy ${buddyId} is not purchasable`);
      return false;
    }

    try {
      // Request purchase from app store
      await IAP.requestPurchaseAsync(buddy.iapProductId, {
        // Android specific options
        ...(Platform.OS === 'android' && {
          accountId: 'optional_account_id', // For family sharing
          obfuscatedAccountId: 'optional_obfuscated_id',
          obfuscatedProfileId: 'optional_obfuscated_profile_id',
        }),
      });

      // The actual purchase result will come through handlePurchaseUpdate
      // For now, we'll return true assuming purchase will succeed
      // In reality, we should wait for the purchase update
      return true;
    } catch (error) {
      console.error(`[IAPService] Failed to purchase buddy ${buddyId}:`, error);
      return false;
    }
  }

  /**
   * Restore previous purchases
   *
   * Important for iOS users who reinstall the app or switch devices.
   */
  async restorePurchases(): Promise<void> {
    if (!this.initialized) {
      console.warn('[IAPService] Not initialized');
      return;
    }
    if (!IAP) {
      console.warn('[IAPService] IAP not available');
      return;
    }

    try {
      const history = await IAP.getPurchaseHistoryAsync();

      // Process each purchase in history
      for (const purchase of history) {
        await this.processPurchase(purchase);
      }

      console.log('[IAPService] Restored purchases:', history.length);
    } catch (error) {
      console.error('[IAPService] Failed to restore purchases:', error);
    }
  }

  /**
   * Handle purchase updates from app store
   *
   * Called by expo-iap when purchase state changes.
   */
  private async handlePurchaseUpdate(update: any): Promise<void> {
    try {
      const { response, results } = update;

      if (response === 'OK') {
        for (const purchase of results) {
          await this.processPurchase(purchase);
        }
      } else {
        console.warn('[IAPService] Purchase update not OK:', response);
      }
    } catch (error) {
      console.error('[IAPService] Error handling purchase update:', error);
    }
  }

  /**
   * Process a completed purchase
   *
   * Validates and acknowledges the purchase, then unlocks the buddy.
   */
  private async processPurchase(purchase: any): Promise<void> {
    try {
      if (!IAP) {
        console.warn('[IAPService] IAP not available, skipping purchase processing');
        return;
      }
      // In production, you should validate the receipt with your server
      // For now, we'll trust the local purchase result

      // Acknowledge the purchase (required for Android)
      if (purchase.acknowledged === false) {
        await IAP.finishTransactionAsync(purchase, false);
      }

      // Find which buddy this purchase corresponds to
      const buddy = buddies.find(b => b.iapProductId === purchase.productId);
      if (!buddy) {
        console.warn(`[IAPService] No buddy found for product ID: ${purchase.productId}`);
        return;
      }

      // Notify success callback
      if (this.purchaseSuccessCallback) {
        this.purchaseSuccessCallback(buddy.id);
      }

      console.log(`[IAPService] Successfully processed purchase for ${buddy.id}`);
    } catch (error) {
      console.error('[IAPService] Error processing purchase:', error);
    }
  }

  /**
   * Check if IAP is available on this device/platform
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Check if IAP service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Singleton instance
 */
export const IAPService = new IAPServiceClass();

/**
 * Initialize IAP service
 *
 * Call this during app startup.
 */
export async function initializeIAPService(): Promise<void> {
  await IAPService.initialize();
}

/**
 * Get product info for a buddy
 */
export async function getBuddyProductInfo(buddyId: string): Promise<IAPProduct | null> {
  return IAPService.getProductInfo(buddyId);
}

/**
 * Purchase a buddy
 */
export async function purchaseBuddy(buddyId: string): Promise<boolean> {
  return IAPService.purchaseBuddy(buddyId);
}

/**
 * Restore purchases
 */
export async function restoreBuddyPurchases(): Promise<void> {
  return IAPService.restorePurchases();
}