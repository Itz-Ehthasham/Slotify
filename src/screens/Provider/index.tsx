import { AppScreenBackground } from '@/constants/screen';
import { StyleSheet, Text, View } from 'react-native';

export default function ProviderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Promotions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppScreenBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
