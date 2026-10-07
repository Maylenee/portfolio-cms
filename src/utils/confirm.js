import { Alert, Platform } from 'react-native';

export function confirmAction(message) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message));
  }
  return new Promise((resolve) => {
    Alert.alert('Konfirmasi', message, [
      { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Lanjut', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
