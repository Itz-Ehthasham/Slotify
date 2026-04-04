import { AppScreenBackground } from '@/constants/screen';
import { getProviderDetail } from '@/data/mockProviders';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const fallbackName = typeof params.name === 'string' ? params.name : undefined;
  const detail = getProviderDetail(id || 'unknown', fallbackName);

  const onSelectSlot = (_slot: string) => {
    /* Booking flow */
  };

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
        <Text style={styles.topTitle} numberOfLines={1}>
          Details
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          <Text style={styles.imagePlaceholderText}>Photo coming soon</Text>
        </View>

        <Text style={styles.name}>{detail.name}</Text>
        <Text style={styles.description}>{detail.description}</Text>

        <Text style={styles.sectionTitle}>Available slots</Text>
        <View style={styles.slotsRow}>
          {detail.slots.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => onSelectSlot(slot)}
              style={({ pressed }) => [styles.slotChip, pressed && styles.slotChipPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Book ${slot}`}>
              <Text style={styles.slotText}>{slot}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
  topTitle: {
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imagePlaceholder: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.12)',
  },
  slotChipPressed: {
    opacity: 0.88,
    backgroundColor: '#F3F4F6',
  },
  slotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
