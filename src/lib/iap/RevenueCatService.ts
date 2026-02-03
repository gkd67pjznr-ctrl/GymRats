// src/lib/iap/RevenueCatService.ts
// RevenueCat in-app purchase service for AI Gym Buddy system
//
// Replaces expo-iap with RevenueCat for better subscription management,
// cross-platform receipt validation, and analytics.

import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import { buddies } from '../buddyData';
import { captureException, addBreadcrumb } from '../monitoring/sentry';

/**
 * RevenueCat API keys from environment
 * Set these in .env:
 * - EXPO_PUBLIC_REVENUECAT_APPLE_KEY
 * - EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY
 */
const REVENUECAT_APPLE_KEY = Constants.expoConfig?.extra?.revenueCatAppleKey as string | undefined;
const REVENUECAT_GOOGLE_KEY = Constants.expoConfig?.extra?.revenueCatGoogleKey as string | undefined;

/**
 * Product information from RevenueCat
 */
export interface RCProduct {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

/**
 * Entitlement identifiers in RevenueCat dashboard
 * These should match what you configure in RevenueCat
 */
export const ENTITLEMENTS = {
  PREMIUM_BUDDIES: 'premium_buddies',
  LEGENDARY_BUDDIES: 'legendary_buddies',
  ALL_BUDDIES: 'all_buddies',
} as const;

/**
 * RevenueCat Service Singleton
 *
 * Manages in-app purchases using RevenueCat SDK.
 * Handles product fetching, purchases, and entitlement checking.
 */
class RevenueCatServiceClass {
  private initialized: boolean = false;
  private customerInfo: CustomerInfo | null = null;
  private purchaseSuccessCallback: ((buddyId: string) => void) | null = null;

  /**
   * Check if RevenueCat is configured
   */
  isConfigured(): boolean {
    if (Platform.OS === 'ios') {
      return !!REVENUECAT_APPLE_KEY;
    }
    if (Platform.OS === 'android') {
      return !!REVENUECAT_GOOGLE_KEY;
    }
    return false;
  }

  /**
   * Initialize RevenueCat SDK
   *
   * Call this during app startup.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!this.isConfigured()) {
      console.warn('[RevenueCat] No API key configured for this platform');
      return;
    }

    try {
      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure with platform-specific API key
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY! : REVENUECAT_GOOGLE_KEY!;

      await Purchases.configure({ apiKey });

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        this.customerInfo = info;
        this.checkNewEntitlements(info);
      });

      // Get initial customer info
      this.customerInfo = await Purchases.getCustomerInfo();

      this.initialized = true;
      console.log('[RevenueCat] Initialized successfully');

      addBreadcrumb('iap', 'RevenueCat initialized');
    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      captureException(error as Error, { context: 'RevenueCat.initialize' });
      throw error;
    }
  }

  /**
   * Set user ID for RevenueCat (call after auth)
   *
   * Associates purchases with a specific user.
   */
  async setUserId(userId: string): Promise<void> {
    if (!this.initialized) {
      console.warn('[RevenueCat] Not initialized');
      return;
    }

    try {
      const { customerInfo } = await Purchases.logIn(userId);
      this.customerInfo = customerInfo;
      console.log('[RevenueCat] User logged in:', userId);
    } catch (error) {
      console.error('[RevenueCat] Failed to set user:', error);
      captureException(error as Error, { context: 'RevenueCat.setUserId', userId });
    }
  }

  /**
   * Clear user (call on sign out)
   */
  async clearUser(): Promise<void> {
    if (!this.initialized) return;

    try {
      await Purchases.logOut();
      this.customerInfo = null;
      console.log('[RevenueCat] User logged out');
    } catch (error) {
      console.error('[RevenueCat] Failed to log out:', error);
    }
  }

  /**
   * Set callback for successful purchases
   */
  setPurchaseSuccessCallback(callback: (buddyId: string) => void): void {
    this.purchaseSuccessCallback = callback;
  }

  /**
   * Get available offerings (product packages)
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.initialized) {
      console.warn('[RevenueCat] Not initialized');
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      captureException(error as Error, { context: 'RevenueCat.getOfferings' });
      return null;
    }
  }

  /**
   * Get product info for a specific buddy
   */
  async getProductForBuddy(buddyId: string): Promise<RCProduct | null> {
    if (!this.initialized) {
      console.warn('[RevenueCat] Not initialized');
      return null;
    }

    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy || !buddy.iapProductId) {
      console.warn(`[RevenueCat] Buddy ${buddyId} has no IAP product`);
      return null;
    }

    try {
      const offerings = await Purchases.getOfferings();

      // Search for the product in offerings
      for (const offering of Object.values(offerings.all)) {
        for (const pkg of offering.availablePackages) {
          if (pkg.product.identifier === buddy.iapProductId) {
            return {
              identifier: pkg.product.identifier,
              title: pkg.product.title,
              description: pkg.product.description,
              price: pkg.product.price,
              priceString: pkg.product.priceString,
              currencyCode: pkg.product.currencyCode,
            };
          }
        }
      }

      console.warn(`[RevenueCat] Product not found for buddy ${buddyId}`);
      return null;
    } catch (error) {
      console.error('[RevenueCat] Failed to get product:', error);
      return null;
    }
  }

  /**
   * Get product info for multiple buddies
   */
  async getProductsForBuddies(buddyIds: string[]): Promise<Record<string, RCProduct>> {
    if (!this.initialized) return {};

    const result: Record<string, RCProduct> = {};

    try {
      const offerings = await Purchases.getOfferings();

      for (const buddyId of buddyIds) {
        const buddy = buddies.find(b => b.id === buddyId);
        if (!buddy?.iapProductId) continue;

        for (const offering of Object.values(offerings.all)) {
          for (const pkg of offering.availablePackages) {
            if (pkg.product.identifier === buddy.iapProductId) {
              result[buddyId] = {
                identifier: pkg.product.identifier,
                title: pkg.product.title,
                description: pkg.product.description,
                price: pkg.product.price,
                priceString: pkg.product.priceString,
                currencyCode: pkg.product.currencyCode,
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('[RevenueCat] Failed to get products:', error);
    }

    return result;
  }

  /**
   * Purchase a buddy
   */
  async purchaseBuddy(buddyId: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('[RevenueCat] Not initialized');
      return false;
    }

    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy || !buddy.iapProductId) {
      console.warn(`[RevenueCat] Buddy ${buddyId} is not purchasable`);
      return false;
    }

    try {
      addBreadcrumb('iap', `Starting purchase for ${buddyId}`);

      const offerings = await Purchases.getOfferings();

      // Find the package for this product
      let targetPackage: PurchasesPackage | null = null;
      for (const offering of Object.values(offerings.all)) {
        for (const pkg of offering.availablePackages) {
          if (pkg.product.identifier === buddy.iapProductId) {
            targetPackage = pkg;
            break;
          }
        }
        if (targetPackage) break;
      }

      if (!targetPackage) {
        console.error(`[RevenueCat] Package not found for product ${buddy.iapProductId}`);
        return false;
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage(targetPackage);
      this.customerInfo = customerInfo;

      // Check if purchase granted the expected entitlement
      const entitlement = buddy.tier === 'legendary'
        ? ENTITLEMENTS.LEGENDARY_BUDDIES
        : ENTITLEMENTS.PREMIUM_BUDDIES;

      if (customerInfo.entitlements.active[entitlement]) {
        console.log(`[RevenueCat] Purchase successful for ${buddyId}`);

        if (this.purchaseSuccessCallback) {
          this.purchaseSuccessCallback(buddyId);
        }

        addBreadcrumb('iap', `Purchase completed for ${buddyId}`);
        return true;
      }

      // Also check all_buddies entitlement
      if (customerInfo.entitlements.active[ENTITLEMENTS.ALL_BUDDIES]) {
        console.log(`[RevenueCat] All buddies entitlement granted for ${buddyId}`);

        if (this.purchaseSuccessCallback) {
          this.purchaseSuccessCallback(buddyId);
        }

        return true;
      }

      console.warn(`[RevenueCat] Purchase completed but entitlement not found`);
      return false;
    } catch (error: any) {
      // Check for user cancellation
      if (error.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
        return false;
      }

      console.error(`[RevenueCat] Purchase failed for ${buddyId}:`, error);
      captureException(error, { context: 'RevenueCat.purchaseBuddy', buddyId });
      return false;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<void> {
    if (!this.initialized) {
      console.warn('[RevenueCat] Not initialized');
      return;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      this.customerInfo = customerInfo;

      console.log('[RevenueCat] Purchases restored');
      this.checkNewEntitlements(customerInfo);
    } catch (error) {
      console.error('[RevenueCat] Failed to restore purchases:', error);
      captureException(error as Error, { context: 'RevenueCat.restorePurchases' });
      throw error;
    }
  }

  /**
   * Check if user has a specific entitlement
   */
  hasEntitlement(entitlementId: string): boolean {
    if (!this.customerInfo) return false;
    return !!this.customerInfo.entitlements.active[entitlementId];
  }

  /**
   * Check if a buddy is unlocked via entitlements
   */
  isBuddyUnlocked(buddyId: string): boolean {
    const buddy = buddies.find(b => b.id === buddyId);
    if (!buddy) return false;

    // Basic tier is always unlocked
    if (buddy.tier === 'basic') return true;

    // Check all_buddies entitlement first
    if (this.hasEntitlement(ENTITLEMENTS.ALL_BUDDIES)) return true;

    // Check tier-specific entitlement
    if (buddy.tier === 'premium') {
      return this.hasEntitlement(ENTITLEMENTS.PREMIUM_BUDDIES);
    }
    if (buddy.tier === 'legendary') {
      return this.hasEntitlement(ENTITLEMENTS.LEGENDARY_BUDDIES);
    }

    return false;
  }

  /**
   * Get all unlocked buddy IDs
   */
  getUnlockedBuddyIds(): string[] {
    return buddies
      .filter(b => this.isBuddyUnlocked(b.id))
      .map(b => b.id);
  }

  /**
   * Check for new entitlements and notify callback
   */
  private checkNewEntitlements(customerInfo: CustomerInfo): void {
    if (!this.purchaseSuccessCallback) return;

    // Check each buddy to see if it's now unlocked
    for (const buddy of buddies) {
      if (buddy.tier === 'basic') continue;

      if (this.isBuddyUnlocked(buddy.id)) {
        // Note: This might call callback for already-unlocked buddies
        // The callback handler should be idempotent
        this.purchaseSuccessCallback(buddy.id);
      }
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if IAP is available on this platform
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

/**
 * Singleton instance
 */
export const RevenueCatService = new RevenueCatServiceClass();

// Export convenience functions
export const initializeRevenueCat = () => RevenueCatService.initialize();
export const purchaseBuddyRC = (buddyId: string) => RevenueCatService.purchaseBuddy(buddyId);
export const restorePurchasesRC = () => RevenueCatService.restorePurchases();
export const getBuddyProductRC = (buddyId: string) => RevenueCatService.getProductForBuddy(buddyId);
