import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled || loading) return colors.neutral[400];
    switch (variant) {
      case 'primary':
        return colors.primary.gold;
      case 'secondary':
        return colors.primary.orange;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.error;
      default:
        return colors.primary.gold;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return colors.white;
    switch (variant) {
      case 'outline':
        return colors.primary.gold;
      default:
        return colors.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.primary.gold;
    return 'transparent';
  };

  const getPaddingVertical = () => {
    switch (size) {
      case 'small':
        return spacing[2];
      case 'medium':
        return spacing[3];
      case 'large':
        return spacing[4];
      default:
        return spacing[3];
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'small':
        return spacing[4];
      case 'medium':
        return spacing[6];
      case 'large':
        return spacing[8];
      default:
        return spacing[6];
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderRadius: radii.md,
          paddingVertical: getPaddingVertical(),
          paddingHorizontal: getPaddingHorizontal(),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (disabled || loading) ? 0.6 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontWeight: '600',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};
