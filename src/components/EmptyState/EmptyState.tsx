import { View, Text } from 'react-native';
import { colors, spacing } from '@/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing[6] }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: colors.neutral[800],
          textAlign: 'center',
          marginBottom: spacing[2],
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 14,
            color: colors.neutral[600],
            textAlign: 'center',
            marginBottom: spacing[4],
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Text
          onPress={onAction}
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.primary.gold,
          }}
        >
          {actionLabel}
        </Text>
      )}
    </View>
  );
};
