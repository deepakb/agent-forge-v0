// Enterprise Design System Constants

// Typography
export const typography = {
  // Display text (for headlines and large text)
  display: {
    '2xl': 'font-display text-display-2xl',
    xl: 'font-display text-display-xl',
    lg: 'font-display text-display-lg',
    md: 'font-display text-display-md',
    sm: 'font-display text-display-sm',
    xs: 'font-display text-display-xs',
  },
  // Body text
  body: {
    '2xl': 'font-body text-body-2xl',
    xl: 'font-body text-body-xl',
    lg: 'font-body text-body-lg',
    md: 'font-body text-body-md',
    sm: 'font-body text-body-sm',
    xs: 'font-body text-body-xs',
  },
  // UI text (for buttons, labels, etc.)
  ui: {
    md: 'font-sans text-ui-md',
    sm: 'font-sans text-ui-sm',
    xs: 'font-sans text-ui-xs',
  },
}

// Spacing
export const spacing = {
  section: {
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-24 md:py-32',
  },
  stack: {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  inline: {
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
}

// Components
export const components = {
  // Card variants
  card: {
    base: 'rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200',
    interactive: 'rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-brand-500 transition-all duration-200',
    feature: 'rounded-xl border border-neutral-100 bg-gradient-to-b from-white to-neutral-50/50 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all duration-200',
  },
  // Button variants
  button: {
    primary: 'inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
    secondary: 'inline-flex items-center justify-center rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
    outline: 'inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  },
  // Input variants
  input: {
    base: 'block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder-neutral-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
    error: 'block w-full rounded-lg border border-error-500 px-3 py-2 text-sm placeholder-neutral-400 shadow-sm focus:border-error-500 focus:outline-none focus:ring-1 focus:ring-error-500',
  },
}

// Container widths
export const containers = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
}

// Gradients
export const gradients = {
  brand: 'bg-gradient-to-r from-brand-600 to-brand-500',
  subtle: 'bg-gradient-to-b from-neutral-50 to-white',
  feature: 'bg-gradient-to-b from-white to-neutral-50/50',
}

// Shadows with backdrop blur
export const shadows = {
  sm: 'shadow-sm backdrop-blur-sm',
  md: 'shadow-md backdrop-blur-md',
  lg: 'shadow-lg backdrop-blur-lg',
}

// Animation variants
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleUp: 'animate-scale-up',
}
