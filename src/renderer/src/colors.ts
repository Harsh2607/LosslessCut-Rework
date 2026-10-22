/**
 * LosslessCut Unified Theme & Color Token Bridge
 * Connects TypeScript components with CSS custom property design tokens.
 */

export const saveColor = 'var(--llc-status-success, var(--green-11))';
export const dangerColor = 'var(--llc-status-danger, var(--red-11))';
export const warningColor = 'var(--llc-status-warning, var(--orange-9))';
export const primaryColor = 'var(--llc-accent, var(--cyan-9))';
export const primaryTextColor = 'var(--llc-text-accent, var(--cyan-11))';
export const controlsBackground = 'var(--llc-bg-surface, var(--gray-4))';
export const timelineBackground = 'var(--llc-bg-canvas, var(--gray-2))';
export const darkModeTransition = 'background var(--llc-dur-normal, 0.22s) var(--llc-ease-standard, ease), color var(--llc-dur-normal, 0.22s) var(--llc-ease-standard, ease)';

/**
 * Strongly typed design token accessors for inline styles and JS canvas manipulation.
 */
export const tokens = {
  surface: {
    canvas: 'var(--llc-bg-canvas)',
    surface: 'var(--llc-bg-surface)',
    elevated: 'var(--llc-bg-surface-elevated)',
    hover: 'var(--llc-bg-surface-hover)',
    card: 'var(--llc-bg-card)',
    cardHover: 'var(--llc-bg-card-hover)',
    glass: 'var(--llc-bg-glass)',
    dock: 'var(--llc-bg-dock)',
    overlay: 'var(--llc-bg-overlay)',
  },
  border: {
    subtle: 'var(--llc-border-subtle)',
    default: 'var(--llc-border-default)',
    strong: 'var(--llc-border-strong)',
    active: 'var(--llc-border-active)',
    glow: 'var(--llc-border-glow)',
  },
  text: {
    primary: 'var(--llc-text-primary)',
    secondary: 'var(--llc-text-secondary)',
    tertiary: 'var(--llc-text-tertiary)',
    muted: 'var(--llc-text-muted)',
    inverse: 'var(--llc-text-inverse)',
    accent: 'var(--llc-text-accent)',
  },
  accent: {
    primary: 'var(--llc-accent)',
    hover: 'var(--llc-accent-hover)',
    active: 'var(--llc-accent-active)',
    subtle: 'var(--llc-accent-subtle)',
    glow: 'var(--llc-accent-glow)',
    gradient: 'var(--llc-accent-gradient)',
  },
  playhead: {
    needle: 'var(--llc-playhead-needle)',
    glow: 'var(--llc-playhead-glow)',
  },
  status: {
    success: 'var(--llc-status-success)',
    warning: 'var(--llc-status-warning)',
    danger: 'var(--llc-status-danger)',
    info: 'var(--llc-status-info)',
  },
  shadow: {
    xs: 'var(--llc-shadow-xs)',
    sm: 'var(--llc-shadow-sm)',
    md: 'var(--llc-shadow-md)',
    lg: 'var(--llc-shadow-lg)',
    xl: 'var(--llc-shadow-xl)',
  },
  radius: {
    sm: 'var(--llc-radius-sm)',
    md: 'var(--llc-radius-md)',
    lg: 'var(--llc-radius-lg)',
    xl: 'var(--llc-radius-xl)',
    full: 'var(--llc-radius-full)',
  },
} as const;
