import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Used when no PNG is registered for this category */
export const SERVICE_HERO_ICON: Record<string, IoniconName> = {
  cleaning: 'sparkles-outline',
  'hair salon': 'cut-outline',
  'tv repair': 'tv-outline',
  carpenter: 'hammer-outline',
  painting: 'color-palette-outline',
  plumbing: 'water-outline',
  electrician: 'flash-outline',
  'smart home': 'wifi-outline',
  handyman: 'construct-outline',
};

export function getServiceHeroIconName(category: string | undefined): IoniconName {
  const key = category?.trim().toLowerCase() ?? '';
  return SERVICE_HERO_ICON[key] ?? 'grid-outline';
}
