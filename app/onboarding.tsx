import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/theme';
import { useAppStore, useAuthStore } from '@/store';
import type { ListRenderItem } from 'react-native';
import { PressableScale } from '@/components/pressable-scale';
import { haptics } from '@/utils/haptics';
import { LottieAnimation } from '@/components/lottie-animation';

const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  iconBg: string;
  iconColor: string;
  lottieSource?: unknown;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: 'diamond',
    title: 'Welcome to S Lunawat Finance',
    body: 'Your trusted partner for gold loans and financial services. Fast, secure, and always within reach.',
    iconBg: '',
    iconColor: colors.primary.gold,
    lottieSource: require('../assets/lottie/welcome.json'),
  },
  {
    id: '2',
    icon: 'document-text',
    title: 'Manage Your Loans',
    body: 'Track all your active and closed loans in one place. View outstanding amounts, interest, and due dates effortlessly.',
    iconBg: '',
    iconColor: '#4CAF50',
    lottieSource: require('../assets/lottie/manage-loans.json'),
  },
  {
    id: '3',
    icon: 'card',
    title: 'Easy & Secure Payments',
    body: 'Make payments online via BillDesk with multiple options — UPI, cards, net banking — all from your phone.',
    iconBg: '',
    iconColor: '#2196F3',
    lottieSource: require('../assets/lottie/secure-payments.json'),
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'Bank-Grade Security',
    body: 'Your data is protected with PIN lock and biometric authentication. We keep your financial information safe.',
    iconBg: '',
    iconColor: '#9C27B0',
    lottieSource: require('../assets/lottie/bank-security.json'),
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Slide>);

const renderSlide: ListRenderItem<Slide> = ({ item }) => (
  <View style={styles.slide}>
    {/* Decorative background circles */}
    <View style={[styles.decorCircle, styles.decorCircleTop, { backgroundColor: item.iconColor }]} />
    <View style={[styles.decorCircle, styles.decorCircleBottom, { backgroundColor: item.iconColor }]} />

    {/* Lottie / Icon */}
    <View style={styles.visualWrap}>
      {item.lottieSource ? (
        <LottieAnimation source={item.lottieSource} size={220} autoPlay loop />
      ) : (
        <View style={[styles.fallbackIconWrap, { backgroundColor: item.iconBg || item.iconColor + '15' }]}>
          <Ionicons name={item.icon} size={56} color={item.iconColor} />
        </View>
      )}
    </View>

    {/* Text */}
    <View style={styles.textWrap}>
      <Text style={styles.slideTitle}>   {item.title}      </Text>
      <Text style={styles.slideBody}>   {item.body}    </Text>
    </View>
  </View>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      setOnboarded(true);
      if (isAuthenticated) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }
    const nextIndex = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  }, [currentIndex, isLastSlide, isAuthenticated, router, setOnboarded]);

  const handleSkip = useCallback(() => {
    setOnboarded(true);
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router, setOnboarded]);

  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_W);
        setCurrentIndex(index);
      },
    },
  );

  return (
    <LinearGradient
      colors={['#FFF9F0', '#FDFBF5', '#FFF8E7']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        {!isLastSlide && (
          <PressableScale scale={0.95} style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip </Text>
          </PressableScale>
        )}

        {/* Slides */}
        <AnimatedFlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled
          bounces={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_W,
            offset: SCREEN_W * index,
            index,
          })}
        />

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / SLIDES.length) * 100}%` },
              ]}
            />
          </View>

          <View style={styles.bottomRow}>
            {/* Slide counter */}
            <Text style={styles.slideCounter}>
              {String(currentIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0') + ' '}
            </Text>

            {/* Next / Get Started */}
            <PressableScale
              scale={0.96}
              style={styles.nextBtn}
              onPress={() => {
                haptics.medium();
                handleNext();
              }}
            >
              <Text style={styles.nextBtnText}>
                {isLastSlide ? 'Get Started  ' : 'Next '}
              </Text>
              <Ionicons
                name={isLastSlide ? 'checkmark' : 'arrow-forward'}
                size={18}
                color={colors.white}
              />
            </PressableScale>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  skipBtn: {
    position: 'absolute',
    top: spacing[6],
    right: spacing[6],
    zIndex: 10,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[20],
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  decorCircleTop: {
    width: 280,
    height: 280,
    top: -60,
    right: -80,
  },
  decorCircleBottom: {
    width: 200,
    height: 200,
    bottom: 80,
    left: -60,
  },
  visualWrap: {
    marginBottom: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  fallbackIconWrap: {
    width: 160,
    height: 160,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    alignItems: 'center',
    maxWidth: 340,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[3],
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  slideBody: {
    fontSize: 15,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 310,
  },
  bottomBar: {
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.gold,
    borderRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  slideCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[400],
    letterSpacing: 1,
  },
  nextBtn: {
    backgroundColor: colors.primary.gold,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    width: '100%',
    maxWidth: 280,
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.4,
    marginRight: spacing[2],
  },
});
