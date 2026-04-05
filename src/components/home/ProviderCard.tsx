import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ProviderCardProps = {
  name: string;
  category: string;
  address?: string;
  imageUrl?: string;
  rating: number;
  onPress: () => void;
  categoryNumberOfLines?: number;
  addressNumberOfLines?: number;
  categoryColor?: string;
};

function formatRating(rating: number): string {
  return Number.isInteger(rating) ? `${rating}.0` : String(rating);
}

function ProviderCardInner({
  name,
  category,
  address,
  imageUrl,
  rating,
  onPress,
  categoryNumberOfLines = 1,
  addressNumberOfLines = 2,
  categoryColor,
}: ProviderCardProps) {
  const a11yExtra = address ? `, ${address}` : '';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${category}${a11yExtra}, ${formatRating(rating)} stars`}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} contentFit="cover" transition={120} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person-outline" size={28} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.category, categoryColor != null ? { color: categoryColor } : null]}
          numberOfLines={categoryNumberOfLines}>
          {category}
        </Text>
        {address?.trim() ? (
          <Text style={styles.address} numberOfLines={addressNumberOfLines}>
            {address.trim()}
          </Text>
        ) : null}
      </View>
      <View style={styles.rating}>
        <Ionicons name="star" size={14} color="#CA8A04" />
        <Text style={styles.ratingText}>{formatRating(rating)}</Text>
      </View>
    </Pressable>
  );
}

export const ProviderCard = memo(ProviderCardInner);

const AVATAR = 56;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.94,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 15, 0.06)',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  address: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 18,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F0F0F',
  },
});
