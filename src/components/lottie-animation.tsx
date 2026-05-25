import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { useRef, useEffect } from 'react';

interface LottieAnimationProps {
  source: unknown;
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  style?: object;
}

export function LottieAnimation({
  source,
  size = 200,
  autoPlay = true,
  loop = true,
  style,
}: LottieAnimationProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  if (!source) {
    return <View style={[{ width: size, height: size }, style]} />;
  }

  return (
    <LottieView
      ref={animationRef}
      source={source as never}
      autoPlay={autoPlay}
      loop={loop}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

