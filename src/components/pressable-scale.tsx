import {
  TouchableOpacity,
  Animated,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useRef, useCallback } from 'react';

interface PressableScaleProps extends TouchableOpacityProps {
  scale?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  scale = 0.96,
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const animValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<TouchableOpacityProps['onPressIn']>>[0]) => {
      Animated.spring(animValue, {
        toValue: scale,
        useNativeDriver: true,
        friction: 5,
        tension: 300,
      }).start();
      onPressIn?.(e);
    },
    [animValue, scale, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<TouchableOpacityProps['onPressOut']>>[0]) => {
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 300,
      }).start();
      onPressOut?.(e);
    },
    [animValue, onPressOut],
  );

  return (
    <Animated.View style={{ transform: [{ scale: animValue }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
