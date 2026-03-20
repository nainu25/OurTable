import Toast from 'react-native-toast-message';

/**
 * 📢 Global Toast Utility
 * Replaces disruptive native alerts with premium, non-disruptive feedback banners.
 */
export const toast = {
  success: (message: string) =>
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
    }),
  error: (message: string) =>
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message || 'Something went wrong',
      position: 'bottom',
      visibilityTime: 4000,
    }),
  info: (message: string) =>
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
    }),
};

export default toast;
