import { useState, useCallback } from 'react';
import { AlertButton, CustomAlertProps } from './CustomAlert';

interface AlertOptions extends Omit<CustomAlertProps, 'visible' | 'onClose'> {}

export const useCustomAlert = () => {
  const [alert, setAlert] = useState<CustomAlertProps | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert({
      ...options,
      visible: true,
      onClose: () => setAlert(null),
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Convenience methods matching Alert.alert API
  const showStandardAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons,
      type: 'info',
    });
  }, [showAlert]);

  return {
    alert: showStandardAlert,
    showAlert,
    hideAlert,
    alertState: alert,
  };
};

export default useCustomAlert;
