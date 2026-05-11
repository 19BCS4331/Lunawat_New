import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
  type?: 'info' | 'success' | 'error' | 'warning';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  onClose,
  type = 'info',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#2E7D32';
      case 'error':
        return '#B71C1C';
      case 'warning':
        return '#E65100';
      default:
        return '#1565C0';
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return '#E8F5E9';
      case 'error':
        return '#FFEBEE';
      case 'warning':
        return '#FFF3E0';
      default:
        return '#E3F2FD';
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onClose?.();
  };

  const renderButton = (button: AlertButton, index: number) => {
    const isLast = index === buttons.length - 1;
    const isDestructive = button.style === 'destructive';
    const isCancel = button.style === 'cancel';

    const buttonStyle = [
      styles.button,
      isCancel && styles.buttonCancel,
      isDestructive && styles.buttonDestructive,
      !isLast && styles.buttonBorder,
    ];

    const textStyle = [
      styles.buttonText,
      isCancel && styles.buttonTextCancel,
      isDestructive && styles.buttonTextDestructive,
    ];

    return (
      <TouchableOpacity
        key={index}
        style={buttonStyle}
        onPress={() => handleButtonPress(button)}
        activeOpacity={0.7}
      >
        <Text style={textStyle}>{button.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
            <Ionicons name={getIcon()} size={32} color={getIconColor()} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map(renderButton)
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing[4],
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  message: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing[5],
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing[3],
  },
  button: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  buttonCancel: {
    // Default cancel style
  },
  buttonDestructive: {
    // Destructive style
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.gold,
  },
  buttonTextCancel: {
    color: colors.neutral[500],
  },
  buttonTextDestructive: {
    color: colors.error,
  },
});

export default CustomAlert;
