export const colors = {
  primary: {
    gold: '#D4AF37',
    orange: '#FF8C00',
    light: '#FFE4B5',
    dark: '#B8860B',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  white: '#FFFFFF',
  black: '#000000',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
} as const;

export type ColorKey = keyof typeof colors;
