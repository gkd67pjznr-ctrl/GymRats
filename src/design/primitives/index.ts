/**
 * Design Primitives - Unified Export
 *
 * Theme-aware primitive components that form the foundation of the UI.
 */

// Surface primitives
export { Surface, SurfacePresets } from './Surface';
export type { SurfaceProps } from './Surface';

// Card primitives
export { Card, CardPresets } from './Card';
export type { CardProps, CardVariant, CardSize } from './Card';

// Glass panel primitives
export { GlassPanel, GlassPanelPresets, useGlassBlurIntensity } from './GlassPanel';
export type { GlassPanelProps, GlassIntensity } from './GlassPanel';

// Text primitives
export { Text, TextPresets } from './Text';
export type { TextProps, TextVariant, TextColor } from './Text';

// Button primitives
export { Button, ButtonPresets, IconButton } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize, IconButtonProps } from './Button';
