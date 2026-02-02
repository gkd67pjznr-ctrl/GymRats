# Forgerank Premium Content System

## Overview

This document outlines the implementation of Forgerank's premium content system, which enables monetization of visual themes, audio packs, and other premium aesthetic elements while maintaining a great free user experience.

## Premium Content Tiers

### Free Tier
- Basic themes (Toxic Energy, Iron Forge)
- Standard illustrations and animations
- Core audio feedback
- Basic haptic patterns

### Premium Tier ($4.99/month or $29.99/year)
- All free content plus:
- Neon Glow theme
- Premium illustration packs
- Enhanced audio experiences
- Advanced animation effects
- Priority customer support

### Legendary Tier ($9.99/month or $59.99/year)
- All premium content plus:
- Cosmic Strength theme
- Legendary Mystery theme
- Full theme transformation capabilities
- Voice lines and narrated experiences
- Exclusive seasonal content
- Early access to new features

## Content Gating Implementation

### User Access Control

```typescript
// src/lib/premium/PremiumAccess.ts
class PremiumAccess {
  private static instance: PremiumAccess;
  private userSubscription: SubscriptionStatus | null = null;

  private constructor() {
    this.initializeSubscriptionListener();
  }

  static getInstance(): PremiumAccess {
    if (!PremiumAccess.instance) {
      PremiumAccess.instance = new PremiumAccess();
    }
    return PremiumAccess.instance;
  }

  async hasAccessToContent(contentId: string): Promise<boolean> {
    const content = await getContentMetadata(contentId);

    // Free content is always accessible
    if (!content.isPremium && !content.isLegendary) {
      return true;
    }

    // Check user subscription status
    const subscription = await this.getUserSubscription();

    if (!subscription || !subscription.isActive) {
      return false;
    }

    // Legendary content requires legendary subscription
    if (content.isLegendary) {
      return subscription.tier === 'legendary';
    }

    // Premium content requires at least premium subscription
    return subscription.tier === 'premium' || subscription.tier === 'legendary';
  }

  private async getUserSubscription(): Promise<SubscriptionStatus | null> {
    // Implementation depends on IAP provider (RevenueCat, etc.)
    return this.userSubscription;
  }

  async purchasePremium() {
    try {
      const purchase = await InAppPurchases.purchase('premium_monthly');
      await this.processPurchase(purchase);
      return true;
    } catch (error) {
      console.error('Premium purchase failed:', error);
      return false;
    }
  }

  async purchaseLegendary() {
    try {
      const purchase = await InAppPurchases.purchase('legendary_monthly');
      await this.processPurchase(purchase);
      return true;
    } catch (error) {
      console.error('Legendary purchase failed:', error);
      return false;
    }
  }
}
```

### Content Metadata System

```typescript
// src/lib/premium/ContentMetadata.ts
interface ContentMetadata {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  requiredTier: 'free' | 'premium' | 'legendary';
  isPremium: boolean;
  isLegendary: boolean;
  price?: number; // For individual item purchases
  purchaseType: 'subscription' | 'one-time';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

type ContentType =
  | 'theme'
  | 'illustration'
  | 'audio'
  | 'animation'
  | 'voice-line'
  | 'sound-pack';

class ContentMetadataRegistry {
  private registry: Map<string, ContentMetadata> = new Map();

  registerContent(metadata: ContentMetadata) {
    this.registry.set(metadata.id, metadata);
  }

  getContentMetadata(contentId: string): ContentMetadata | undefined {
    return this.registry.get(contentId);
  }

  getContentsByTier(tier: 'free' | 'premium' | 'legendary'): ContentMetadata[] {
    return Array.from(this.registry.values()).filter(content => {
      if (tier === 'free') return !content.isPremium && !content.isLegendary;
      if (tier === 'premium') return !content.isLegendary;
      if (tier === 'legendary') return true;
      return false;
    });
  }

  getContentsByType(type: ContentType): ContentMetadata[] {
    return Array.from(this.registry.values()).filter(content => content.type === type);
  }
}
```

## Theme-Based Premium Content

### Theme Unlocking

```typescript
// src/lib/premium/ThemeAccess.ts
class ThemeAccess {
  private premiumAccess: PremiumAccess;
  private contentRegistry: ContentMetadataRegistry;

  constructor() {
    this.premiumAccess = PremiumAccess.getInstance();
    this.contentRegistry = new ContentMetadataRegistry();
    this.initializeThemeContent();
  }

  async canUseTheme(themeId: string): Promise<boolean> {
    return this.premiumAccess.hasAccessToContent(themeId);
  }

  async getAvailableThemes(): Promise<ThemeConfiguration[]> {
    const allThemes = getAllThemes();
    const availableThemes: ThemeConfiguration[] = [];

    for (const theme of allThemes) {
      if (await this.canUseTheme(theme.id)) {
        availableThemes.push(theme);
      }
    }

    return availableThemes;
  }

  private initializeThemeContent() {
    // Register all theme content with appropriate tier requirements
    this.contentRegistry.registerContent({
      id: 'toxic-energy',
      name: 'Toxic Energy',
      description: 'High-intensity moments with vibrant magenta and electric blue',
      type: 'theme',
      requiredTier: 'free',
      isPremium: false,
      isLegendary: false,
      tags: ['energy', 'vibrant'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      purchaseType: 'subscription'
    });

    this.contentRegistry.registerContent({
      id: 'neon-glow',
      name: 'Neon Glow',
      description: 'Bold and vibrant with electric lime and hot pink',
      type: 'theme',
      requiredTier: 'premium',
      isPremium: true,
      isLegendary: false,
      tags: ['growth', 'vibrant'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      purchaseType: 'subscription'
    });

    this.contentRegistry.registerContent({
      id: 'legendary-mystery',
      name: 'Legendary Mystery',
      description: 'Theme-warping presence with unique personality',
      type: 'theme',
      requiredTier: 'legendary',
      isPremium: false,
      isLegendary: true,
      tags: ['mystery', 'legendary'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      purchaseType: 'subscription'
    });
  }
}
```

## Individual Content Purchases

### One-Time Purchases

Some premium content can be purchased individually:

```typescript
// src/lib/premium/IndividualPurchases.ts
class IndividualPurchases {
  private contentRegistry: ContentMetadataRegistry;

  constructor() {
    this.contentRegistry = new ContentMetadataRegistry();
    this.initializeIndividualContent();
  }

  async purchaseContent(contentId: string): Promise<boolean> {
    try {
      const content = this.contentRegistry.getContentMetadata(contentId);
      if (!content || content.purchaseType !== 'one-time') {
        throw new Error('Content not available for individual purchase');
      }

      const purchase = await InAppPurchases.purchase(contentId);
      await this.processPurchase(purchase, contentId);

      // Unlock content for user
      await this.unlockContentForUser(contentId);

      return true;
    } catch (error) {
      console.error('Content purchase failed:', error);
      return false;
    }
  }

  private async unlockContentForUser(contentId: string) {
    // Implementation to persist unlocked content for user
    const user = getCurrentUser();
    user.unlockedContent.push(contentId);
    await saveUser(user);
  }

  private initializeIndividualContent() {
    // Example: Premium workout finish sound pack
    this.contentRegistry.registerContent({
      id: 'premium-workout-finish-pack',
      name: 'Premium Workout Finish Pack',
      description: 'Enhanced audio experience for workout completion',
      type: 'sound-pack',
      requiredTier: 'premium',
      isPremium: true,
      isLegendary: false,
      price: 1.99,
      tags: ['audio', 'workout', 'finish'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      purchaseType: 'one-time'
    });
  }
}
```

## UI Integration

### Premium Badge Component

```typescript
// src/ui/components/PremiumBadge.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeDesignSystem } from '../../ui/hooks/useThemeDesignSystem';

interface PremiumBadgeProps {
  contentId: string;
  onPress?: () => void;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ contentId, onPress }) => {
  const ds = useThemeDesignSystem();
  const [isPremium, setIsPremium] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);

  React.useEffect(() => {
    checkContentAccess(contentId).then(({ isPremiumContent, isLockedContent }) => {
      setIsPremium(isPremiumContent);
      setIsLocked(isLockedContent);
    });
  }, [contentId]);

  if (!isPremium) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isLocked ? ds?.tone.danger : ds?.tone.gold,
        borderColor: ds?.tone.border,
        borderWidth: ds?.strokes.hairline,
        borderRadius: ds?.radii.pill,
        paddingHorizontal: ds ? ds.space.x2 : 8,
        paddingVertical: ds ? ds.space.x1 : 4,
        opacity: isLocked ? 0.7 : 1
      }}
    >
      <Text
        style={{
          color: ds?.tone.text,
          fontSize: ds?.type.caption.size,
          fontWeight: ds?.type.caption.w,
          textTransform: 'uppercase'
        }}
      >
        {isLocked ? 'Locked' : 'Premium'}
      </Text>
    </TouchableOpacity>
  );
};
```

### Theme Store Screen

```typescript
// src/ui/screens/ThemeStoreScreen.tsx
import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { useThemeDesignSystem } from '../../ui/hooks/useThemeDesignSystem';
import { ThemeAccess } from '../../lib/premium/ThemeAccess';
import { PremiumBadge } from '../components/PremiumBadge';

const ThemeStoreScreen: React.FC = () => {
  const ds = useThemeDesignSystem();
  const [themes, setThemes] = React.useState<ThemeConfiguration[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadAvailableThemes();
  }, []);

  const loadAvailableThemes = async () => {
    setLoading(true);
    try {
      const themeAccess = new ThemeAccess();
      const availableThemes = await themeAccess.getAvailableThemes();
      setThemes(availableThemes);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderThemeItem = ({ item }: { item: ThemeConfiguration }) => {
    return (
      <View
        style={{
          backgroundColor: ds?.tone.card,
          borderColor: ds?.tone.border,
          borderWidth: ds?.strokes.hairline,
          borderRadius: ds?.radii.lg,
          padding: ds ? ds.space.x4 : 16,
          marginBottom: ds ? ds.space.x3 : 12
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: ds?.tone.text,
              fontSize: ds?.type.h2.size,
              fontWeight: ds?.type.h2.w
            }}
          >
            {item.name}
          </Text>
          <PremiumBadge contentId={item.id} />
        </View>
        <Text
          style={{
            color: ds?.tone.muted,
            fontSize: ds?.type.body.size,
            fontWeight: ds?.type.body.w,
            marginTop: ds ? ds.space.x2 : 8
          }}
        >
          {item.description}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading themes...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: ds ? ds.space.x4 : 16 }}>
      <Text
        style={{
          color: ds?.tone.text,
          fontSize: ds?.type.h1.size,
          fontWeight: ds?.type.h1.w,
          marginBottom: ds ? ds.space.x4 : 16
        }}
      >
        Theme Store
      </Text>
      <FlatList
        data={themes}
        renderItem={renderThemeItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};
```

## In-App Purchase Integration

### RevenueCat Integration (Example)

```typescript
// src/lib/premium/RevenueCatIntegration.ts
import Purchases from 'react-native-purchases';

class RevenueCatIntegration {
  private static instance: RevenueCatIntegration;

  private constructor() {
    this.initialize();
  }

  static getInstance(): RevenueCatIntegration {
    if (!RevenueCatIntegration.instance) {
      RevenueCatIntegration.instance = new RevenueCatIntegration();
    }
    return RevenueCatIntegration.instance;
  }

  private async initialize() {
    // Initialize RevenueCat with your API key
    await Purchases.configure({
      apiKey: process.env.REVENUECAT_API_KEY!
    });
  }

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageId: string, offeringIdentifier: string) {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings?.all[offeringIdentifier];
      const packageToPurchase = offering?.availablePackages.find(p => p.identifier === packageId);

      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
      return purchaseResult;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw error;
    }
  }

  async getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }
}
```

## Content Delivery and Updates

### Remote Content Management

```typescript
// src/lib/premium/RemoteContentManager.ts
class RemoteContentManager {
  private contentCache: Map<string, any> = new Map();
  private updateListeners: Set<() => void> = new Set();

  async fetchContentMetadata(): Promise<ContentMetadata[]> {
    try {
      // Fetch from remote server or CDN
      const response = await fetch('https://api.forgerank.app/content/metadata');
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Failed to fetch content metadata:', error);
      return [];
    }
  }

  async downloadContent(contentId: string): Promise<boolean> {
    try {
      // Download content from CDN
      const response = await fetch(`https://cdn.forgerank.app/content/${contentId}`);
      const content = await response.blob();

      // Save to local storage
      await this.saveContentLocally(contentId, content);

      // Update cache
      this.contentCache.set(contentId, content);

      // Notify listeners of update
      this.notifyUpdateListeners();

      return true;
    } catch (error) {
      console.error('Failed to download content:', error);
      return false;
    }
  }

  private async saveContentLocally(contentId: string, content: Blob) {
    // Implementation depends on storage solution
    // Could use react-native-fs, AsyncStorage, etc.
  }

  addUpdateListener(listener: () => void) {
    this.updateListeners.add(listener);
  }

  removeUpdateListener(listener: () => void) {
    this.updateListeners.delete(listener);
  }

  private notifyUpdateListeners() {
    this.updateListeners.forEach(listener => listener());
  }
}
```

## Analytics and Reporting

### Premium Usage Analytics

```typescript
// src/lib/analytics/PremiumAnalytics.ts
class PremiumAnalytics {
  static trackContentView(contentId: string, contentType: ContentType) {
    analytics.track('Premium Content Viewed', {
      contentId,
      contentType,
      timestamp: Date.now()
    });
  }

  static trackContentUnlock(contentId: string, method: 'subscription' | 'purchase') {
    analytics.track('Premium Content Unlocked', {
      contentId,
      method,
      timestamp: Date.now()
    });
  }

  static trackPurchaseAttempt(productId: string, price: number) {
    analytics.track('Purchase Attempted', {
      productId,
      price,
      timestamp: Date.now()
    });
  }

  static trackPurchaseSuccess(productId: string, price: number, transactionId: string) {
    analytics.track('Purchase Successful', {
      productId,
      price,
      transactionId,
      timestamp: Date.now()
    });
  }

  static trackPurchaseFailure(productId: string, error: string) {
    analytics.track('Purchase Failed', {
      productId,
      error,
      timestamp: Date.now()
    });
  }
}
```

## Monetization Strategy

### Conversion Optimization

1. **Freemium Model**: Provide excellent core experience with premium enhancements
2. **Value Demonstration**: Show premium content in locked state with previews
3. **Social Proof**: Display user testimonials and ratings
4. **Limited Time Offers**: Create urgency with seasonal promotions
5. **Bundle Deals**: Offer discounts for annual subscriptions

### Pricing Strategy

- **Monthly**: $4.99 (Premium), $9.99 (Legendary)
- **Annual**: $29.99 (Premium - 50% savings), $59.99 (Legendary - 50% savings)
- **Family Sharing**: Up to 6 family members
- **Student Discount**: 30% off with .edu email

### Retention Features

1. **Personalization**: AI-driven content recommendations
2. **Community Features**: Exclusive premium user groups
3. **Early Access**: New themes and features before general release
4. **Exclusive Content**: Seasonal and limited-time offerings
5. **Customer Support**: Priority support channels

This premium content system provides a comprehensive framework for monetizing Forgerank's visual enhancements while maintaining a positive user experience and clear value proposition for paid tiers.