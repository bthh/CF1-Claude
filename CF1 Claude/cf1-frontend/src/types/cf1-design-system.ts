/**
 * CF1 Enterprise Design System Type Definitions
 *
 * Comprehensive TypeScript definitions for the CF1 design system
 * ensuring type safety and consistency across all components.
 *
 * @version 1.0.0
 * @author CF1 Platform Team
 */

// === Core Design System Types ===

/** Standard size options for consistent component sizing */
export type CF1Size = 'sm' | 'md' | 'lg' | 'xl';

/** Standard variant options for component styling */
export type CF1Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger' | 'success';

/** Standard spacing options using design system tokens */
export type CF1Spacing = 'none' | 'small' | 'medium' | 'large';

/** Standard shadow options for depth hierarchy */
export type CF1Shadow = 'none' | 'small' | 'medium' | 'large';

/** Color palette options from CF1 design system */
export type CF1Color =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/** Responsive breakpoints for design system */
export type CF1Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

// === Component-Specific Types ===

/** Button-specific variant options */
export type CF1ButtonVariant = CF1Variant;

/** Button size options with specific touch target requirements */
export type CF1ButtonSize = CF1Size;

/** Card variant options for different use cases */
export type CF1CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

/** Input size options with accessibility compliance */
export type CF1InputSize = CF1Size;

// === Accessibility Types ===

/** ARIA role options for interactive components */
export type CF1AriaRole =
  | 'button'
  | 'link'
  | 'menuitem'
  | 'tab'
  | 'option'
  | 'checkbox'
  | 'radio'
  | 'switch';

/** Screen reader text options */
export interface CF1AccessibilityProps {
  /** ARIA label for screen readers */
  'aria-label'?: string;
  /** ARIA described by for additional context */
  'aria-describedby'?: string;
  /** ARIA expanded state for collapsible elements */
  'aria-expanded'?: boolean;
  /** ARIA pressed state for toggle buttons */
  'aria-pressed'?: boolean;
  /** ARIA selected state for selectable elements */
  'aria-selected'?: boolean;
  /** ARIA disabled state */
  'aria-disabled'?: boolean;
  /** ARIA hidden for decorative elements */
  'aria-hidden'?: boolean;
  /** ARIA live region for dynamic content */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** ARIA role for semantic meaning */
  role?: CF1AriaRole;
}

// === Base Component Props ===

/** Base props that all CF1 components should extend */
export interface CF1BaseProps extends CF1AccessibilityProps {
  /** Additional CSS classes */
  className?: string;
  /** Enable responsive design system (default: true) */
  responsive?: boolean;
  /** Component test identifier */
  'data-testid'?: string;
}

/** Props for interactive components */
export interface CF1InteractiveProps extends CF1BaseProps {
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Keyboard event handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/** Props for components that can be rendered as different elements */
export interface CF1PolymorphicProps<T extends keyof JSX.IntrinsicElements = 'div'>
  extends CF1BaseProps {
  /** HTML element type to render as */
  as?: T;
}

// === Theme and Design Token Types ===

/** Design token values for consistent theming */
export interface CF1DesignTokens {
  colors: {
    primary: Record<number, string>;
    secondary: Record<number, string>;
    accent: Record<number, string>;
    neutral: Record<number, string>;
    success: Record<number, string>;
    warning: Record<number, string>;
    danger: Record<number, string>;
    info: Record<number, string>;
  };
  spacing: Record<string, string>;
  fontSize: Record<string, [string, { lineHeight: string }]>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  animation: Record<string, string>;
}

/** Theme configuration for CF1 components */
export interface CF1Theme {
  mode: 'light' | 'dark';
  tokens: CF1DesignTokens;
  components: {
    button: CF1ComponentTheme;
    card: CF1ComponentTheme;
    input: CF1ComponentTheme;
  };
}

/** Component-specific theme configuration */
export interface CF1ComponentTheme {
  baseClasses: string;
  variants: Record<string, string>;
  sizes: Record<string, string>;
  states: {
    default: string;
    hover: string;
    focus: string;
    active: string;
    disabled: string;
  };
}

// === Enterprise Configuration Types ===

/** Enterprise feature configuration */
export interface CF1EnterpriseConfig {
  /** Strict accessibility mode (WCAG 2.1 AA) */
  strictAccessibility: boolean;
  /** High contrast mode support */
  highContrastMode: boolean;
  /** Reduced motion support */
  reducedMotion: boolean;
  /** Enterprise logging for compliance */
  auditLogging: boolean;
  /** Component usage analytics */
  componentAnalytics: boolean;
}

/** Component library configuration */
export interface CF1ComponentLibraryConfig {
  /** Default component size */
  defaultSize: CF1Size;
  /** Default responsive behavior */
  defaultResponsive: boolean;
  /** Default animation behavior */
  defaultAnimate: boolean;
  /** Enterprise features */
  enterprise: CF1EnterpriseConfig;
  /** Theme configuration */
  theme: CF1Theme;
}

// === Utility Types ===

/** Extract variant type from component props */
export type ExtractVariant<T> = T extends { variant?: infer V } ? V : never;

/** Extract size type from component props */
export type ExtractSize<T> = T extends { size?: infer S } ? S : never;

/** Make specified properties required */
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specified properties optional */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Component props with ref forwarding */
export type CF1ComponentProps<T extends keyof JSX.IntrinsicElements = 'div'> =
  CF1BaseProps &
  Omit<React.ComponentPropsWithRef<T>, keyof CF1BaseProps>;

// === Export all types ===
export type {
  CF1Size,
  CF1Variant,
  CF1Spacing,
  CF1Shadow,
  CF1Color,
  CF1Breakpoint,
  CF1ButtonVariant,
  CF1ButtonSize,
  CF1CardVariant,
  CF1InputSize,
  CF1AriaRole,
  CF1AccessibilityProps,
  CF1BaseProps,
  CF1InteractiveProps,
  CF1PolymorphicProps,
  CF1DesignTokens,
  CF1Theme,
  CF1ComponentTheme,
  CF1EnterpriseConfig,
  CF1ComponentLibraryConfig,
};

/** Default enterprise configuration */
export const defaultEnterpriseConfig: CF1EnterpriseConfig = {
  strictAccessibility: true,
  highContrastMode: true,
  reducedMotion: true,
  auditLogging: true,
  componentAnalytics: false,
};

/** Type guard to check if value is a valid CF1 size */
export const isCF1Size = (value: unknown): value is CF1Size => {
  return typeof value === 'string' && ['sm', 'md', 'lg', 'xl'].includes(value);
};

/** Type guard to check if value is a valid CF1 variant */
export const isCF1Variant = (value: unknown): value is CF1Variant => {
  return typeof value === 'string' &&
    ['primary', 'secondary', 'accent', 'ghost', 'outline', 'danger', 'success'].includes(value);
};