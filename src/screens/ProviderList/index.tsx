import { ProviderCard } from '@/components/home/ProviderCard';
import { AppScreenBackground } from '@/constants/screen';
import type { ListedServiceProvider } from '@/data/providersByService';
import { getProvidersForServiceLabel } from '@/data/providersByService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function paramString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default function ProviderListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const service =
    paramString(params.service)?.trim() && (paramString(params.service)?.length ?? 0) > 0
      ? paramString(params.service)!.trim()
      : 'Services';

  const data = useMemo(() => getProvidersForServiceLabel(service), [service]);

  const openDetail = (p: ListedServiceProvider) => {
    router.push({
      pathname: '/provider-detail',
      params: {
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.image,
        rating: String(p.rating),
      },
    } as Href);
  };

  const renderItem: ListRenderItem<ListedServiceProvider> = ({ item }) => (
    <View style={styles.cardOuter}>
      <ProviderCard
        name={item.name}
        category={item.category}
        imageUrl={item.image}
        rating={item.rating}
        onPress={() => openDetail(item)}
      />
    </View>
  );

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
        <View style={styles.topSpacer} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.listHeading}>Providers near you</Text>
        }
        showsVerticalScrollIndicator={false}
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
  topSpacer: {
    width: 36,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  cardOuter: {
    marginHorizontal: 0,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
    paddingTop: 4,
  },
});
