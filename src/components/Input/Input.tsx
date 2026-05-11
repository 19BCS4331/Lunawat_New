import { TextInput, View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = ({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}: InputProps) => {
  return (
    <View style={[{ marginBottom: spacing[3] }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.neutral[800],
            marginBottom: spacing[1],
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.neutral[50],
            borderWidth: 1,
            borderColor: error ? colors.error : colors.neutral[300],
            borderRadius: radii.md,
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
            fontSize: 16,
            color: colors.neutral[900],
          },
          inputStyle,
        ]}
        placeholderTextColor={colors.neutral[500]}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: colors.error,
            marginTop: spacing[1],
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
