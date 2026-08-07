---
name: Serene Cycle
colors:
  surface: '#fff8f6'
  surface-dim: '#e1d8d5'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ef'
  surface-container: '#f5ece9'
  surface-container-high: '#efe6e3'
  surface-container-highest: '#e9e1de'
  on-surface: '#1e1b19'
  on-surface-variant: '#544340'
  inverse-surface: '#342f2e'
  inverse-on-surface: '#f8efec'
  outline: '#87726f'
  outline-variant: '#dac1bd'
  surface-tint: '#93493c'
  primary: '#93493c'
  on-primary: '#ffffff'
  primary-container: '#e88d7d'
  on-primary-container: '#66271c'
  inverse-primary: '#ffb4a7'
  secondary: '#4a654e'
  on-secondary: '#ffffff'
  secondary-container: '#c9e8cb'
  on-secondary-container: '#4e6952'
  tertiary: '#645d56'
  on-tertiary: '#ffffff'
  tertiary-container: '#aca49b'
  on-tertiary-container: '#403a33'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a7'
  on-primary-fixed: '#3c0703'
  on-primary-fixed-variant: '#763227'
  secondary-fixed: '#cceace'
  secondary-fixed-dim: '#b0ceb2'
  on-secondary-fixed: '#07200f'
  on-secondary-fixed-variant: '#334d38'
  tertiary-fixed: '#ebe1d7'
  tertiary-fixed-dim: '#cec5bc'
  on-tertiary-fixed: '#1f1b15'
  on-tertiary-fixed-variant: '#4c463f'
  background: '#fff8f6'
  on-background: '#1e1b19'
  surface-variant: '#e9e1de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

The design system is built to provide a supportive, non-clinical sanctuary for menstrual health and wellness tracking. The brand personality is empathetic, empowering, and sophisticated, avoiding the stereotypical "bright pink" tropes in favor of a mature, wellness-oriented aesthetic. 

The visual style leverages **Soft Minimalism** with elements of **Tonal Layering**. It prioritizes extreme clarity and generous whitespace to reduce cognitive load during periods of physical or emotional discomfort. The emotional response should be one of calm reliability—like a digital companion that understands the nuances of hormonal health.

## Colors

The palette is rooted in nature and skin tones to evoke a sense of organic health.

- **Primary (Muted Coral):** Used for active states, cycle highlights, and primary calls to action. It is warm and energetic without being aggressive.
- **Secondary (Sage Green):** Used for wellness insights, fertile windows, and "calm" data points. It provides a natural balance to the coral.
- **Tertiary (Warm Sand):** Acts as the primary surface color for cards and containers, providing a softer alternative to pure white.
- **Neutral (Charcoal Earth):** Used for typography and iconography to ensure high legibility while remaining softer than pure black.
- **System Colors:** Success states use a deeper sage; error states use a desaturated terracotta to maintain the "muted" brand feel.

## Typography

This design system utilizes a pairing of two contemporary sans-serifs to achieve a "soft-modern" look. 

**Plus Jakarta Sans** is used for headings. Its slightly wider apertures and rounded terminals feel welcoming and premium. **Be Vietnam Pro** is used for all functional and body text; it offers exceptional legibility at small sizes and a clean, systematic feel that reinforces the "health" aspect of the product.

For mobile headers, use the `-mobile` variants to prevent awkward line breaks. All body text should maintain a minimum 1.5x line height to ensure maximum readability for users who may be experiencing fatigue or blurred vision.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a heavy emphasis on vertical "stacks" for mobile-first utility. 

- **Mobile:** 4-column grid with 20px side margins.
- **Desktop:** 12-column grid with a max-width of 1200px.
- **Spacing Philosophy:** Use the 8px base unit. Generous internal padding (24px+) should be used inside cards to create an "airy" feel. Avoid dense clusters of information; if data is complex, use progressive disclosure.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. 

1. **Floor (Background):** Pure white or `#FBFAF9` (Off-white).
2. **Layer 1 (Cards/Surface):** Use the Tertiary color (Warm Sand) or white with a very soft, high-diffusion shadow (`y-4, blur-20, opacity-0.05`).
3. **Layer 2 (Floating/Modals):** Pure white with a more pronounced "Ambient Shadow" using a slight primary-color tint in the shadow value to maintain warmth.

Avoid hard black shadows or heavy borders. Interactions should feel like surfaces gently lifting toward the user.

## Shapes

The shape language is consistently **Rounded**. Hard corners are non-existent in this design system, as they feel too clinical or aggressive.

- **Standard Elements (Inputs, Small Buttons):** 0.5rem (8px).
- **Cards & Modals:** 1rem (16px).
- **Interactive Pill Components:** 3rem (Full rounded) for selection chips and tags.

Iconography should follow this rule, utilizing a 2px stroke weight with rounded caps and joins.

## Components

- **Buttons:** Primary buttons use the Muted Coral background with white text. Secondary buttons use a ghost style with a Coral border. All buttons have a minimum height of 48px for touch accessibility.
- **Input Fields:** Use a subtle "Sand" background instead of a border in their default state. On focus, transition to a thin Sage Green border.
- **Cards:** Cards are the primary vessel for insights. They should feature `rounded-lg` corners and no border. Header text inside cards should use `headline-md`.
- **Chips/Tags:** Used for symptoms or mood tracking. Use a "Pill-shape" (rounded-xl) with a background color that matches the category (e.g., Sage for wellness, Coral for cycle).
- **Progress Rings:** For cycle tracking, use a thick-stroke (8px) circular progress bar with rounded ends to visualize days remaining.
- **Selection Controls:** Checkboxes and Radio buttons should be oversized (24x24px) to ensure ease of use, utilizing the Primary color for the checked state.