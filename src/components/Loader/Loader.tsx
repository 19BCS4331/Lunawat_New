import { ActivityIndicator, View, Text } from 'react-native';
import { colors, spacing } from '@/theme';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const Loader = ({ size = 'large', color, text }: LoaderProps) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing[4] }}>
      <ActivityIndicator size={size} color={color || colors.primary.gold} />
      {text && (
        <Text style={{ marginTop: spacing[3], color: colors.neutral[600] }}>
          {text}
        </Text>
      )}
    </View>
  );
};
