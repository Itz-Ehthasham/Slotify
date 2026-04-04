import { AppScreenBackground } from '@/constants/screen';
import { mockProvidersForService } from '@/data/mockProviders';
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const service =
    typeof params.service === 'string' && params.service.length > 0 ? params.service : 'Services';

  const data = mockProvidersForService(service);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color="#111111" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {service}
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.listHeading}>Providers near you</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              router.push({
                pathname: '/provider-detail',
                params: { id: item.id, name: item.name },
              } as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}>
            <View style={styles.cardMain}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 36,
  },
  listContent: {
    padding: 18,
    paddingBottom: 32,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardMain: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
});
