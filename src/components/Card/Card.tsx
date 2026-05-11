import { View, ViewStyle } from 'react-native';
import { colors, radii, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = ({ children, style, variant = 'default' }: CardProps) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.white,
      borderRadius: radii.lg,
      padding: 16,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};
