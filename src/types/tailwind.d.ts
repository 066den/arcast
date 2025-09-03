import 'tailwindcss/tailwind.css'

declare module 'tailwindcss/tailwind.css' {
  interface Colors {
    primary: {
      DEFAULT: string
      foreground: string
      dark: string
    }
    secondary: {
      DEFAULT: string
      foreground: string
    }
    muted: {
      DEFAULT: string
      foreground: string
    }
    accent: {
      DEFAULT: string
      foreground: string
    }
    destructive: {
      DEFAULT: string
      foreground: string
    }
    border: string
    input: string
    ring: string
    background: string
    foreground: string
    card: {
      DEFAULT: string
      foreground: string
    }
    popover: {
      DEFAULT: string
      foreground: string
    }
  }

  interface Animation {
    'spin-slow': string
    'fade-in': string
    'slide-in': string
    'bounce-gentle': string
  }

  interface Spacing {
    '18': string
    '88': string
    '128': string
  }

  interface Screens {
    'xs': string
    '3xl': string
  }
}
