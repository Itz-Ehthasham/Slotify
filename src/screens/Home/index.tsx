import { Brand } from '@/constants/brand';
import { AppScreenBackground } from '@/constants/screen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import {
  type ImageSourcePropType,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_RADIUS = 26;
const H_PADDING = 18;
const GRID_GAP = 14;
const SEARCH_FLOAT = 22;
const HEADER_BOTTOM_RESERVE = 64;
const SECTION_AFTER_SEARCH = 10;

/** Full app mark (charcoal tile + lime icon) — sharper than PNG in a nested box */
const brandLogoSvg = require('../../../assets/images/logo.svg') as ImageSourcePropType;

const cleaningIcon = require('../../../assets/icons/cleaning.svg') as ImageSourcePropType;
const repairingIcon = require('../../../assets/icons/repairing.svg') as ImageSourcePropType;
const electricianIcon = require('../../../assets/icons/electrician.svg') as ImageSourcePropType;
const carpenterIcon = require('../../../assets/icons/carpenter.svg') as ImageSourcePropType;
const moreIcon = require('../../../assets/icons/more.svg') as ImageSourcePropType;

type ServiceItem = { key: string; label: string; source: ImageSourcePropType };

const SERVICES: ServiceItem[] = [
  { key: '1', label: 'Cleaning', source: cleaningIcon },
  { key: '2', label: 'Repairing', source: repairingIcon },
  { key: '3', label: 'Electrician', source: electricianIcon },
  { key: '4', label: 'Carpenter', source: carpenterIcon },
  { key: '5', label: 'Repairing', source: repairingIcon },
  { key: '6', label: 'Electrician', source: electricianIcon },
  { key: '7', label: 'Carpenter', source: carpenterIcon },
  { key: '8', label: 'Repairing', source: repairingIcon },
  { key: '9', label: 'More', source: moreIcon },
];

function HomeListHeader() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  return (
    <>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 12) + 10,
            paddingBottom: HEADER_BOTTOM_RESERVE,
            borderBottomLeftRadius: HEADER_RADIUS,
            borderBottomRightRadius: HEADER_RADIUS,
          },
        ]}>
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={styles.logoMarkWrap}>
              <Image source={brandLogoSvg} style={styles.logoMark} contentFit="contain" />
            </View>
            <Text style={styles.brandName}>Slotify</Text>
          </View>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Open menu">
            <Ionicons name="menu-outline" size={28} color={Brand.charcoal} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={22} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="I want to hire a..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Services available around you are...</Text>
      </View>
    </>
  );
}

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();

  const cellSize = useMemo(() => {
    const inner = windowWidth - H_PADDING * 2 - GRID_GAP * 2;
    return inner / 3;
  }, [windowWidth]);

  const renderItem: ListRenderItem<ServiceItem> = useCallback(
    ({ item }) => (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { width: cellSize, height: cellSize },
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.label}>
        <Image source={item.source} style={styles.cardIcon} contentFit="contain" />
        <Text style={styles.cardLabel} numberOfLines={2}>
          {item.label}
        </Text>
      </Pressable>
    ),
    [cellSize],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={SERVICES}
        keyExtractor={(item) => item.key}
        numColumns={3}
        renderItem={renderItem}
        ListHeaderComponent={HomeListHeader}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  listContent: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: Brand.splashBackground,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    minHeight: 62,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  logoMarkWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  logoMark: {
    width: 58,
    height: 58,
  },
  brandName: {
    fontSize: 23,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
  },
  iconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  searchWrap: {
    position: 'absolute',
    left: H_PADDING,
    right: H_PADDING,
    bottom: -SEARCH_FLOAT,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    padding: 0,
  },
  sectionHead: {
    paddingHorizontal: H_PADDING,
    paddingTop: 26,
    paddingBottom: 26,
    marginTop: SEARCH_FLOAT + SECTION_AFTER_SEARCH,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  gridRow: {
    paddingHorizontal: H_PADDING,
    marginBottom: GRID_GAP,
    gap: GRID_GAP,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.94,
  },
  cardIcon: {
    width: 52,
    height: 52,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 17,
  },
});
