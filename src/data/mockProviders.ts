import { findListedProviderById } from '@/data/providersByService';

export type ProviderListRow = { id: string; name: string; subtitle: string };

export function mockProvidersForService(serviceLabel: string): ProviderListRow[] {
  return [
    { id: '1', name: 'Pro Help Desk', subtitle: `${serviceLabel} · Verified` },
    { id: '2', name: 'Neighborhood Pros', subtitle: `${serviceLabel} · Top rated` },
    { id: '3', name: 'Slotify Partner', subtitle: `${serviceLabel} · Fast response` },
  ];
}

const CATEGORY_RATE_BASE: Record<string, number> = {
  Cleaning: 349,
  Electrician: 599,
  Carpenter: 649,
  Plumbing: 449,
  Painting: 499,
  'Hair salon': 299,
  'Smart home': 699,
  'TV repair': 399,
  Handyman: 479,
  Repairing: 449,
  'AC & HVAC': 629,
  Gardening: 379,
};

export function hourlyRateForProvider(id: string, category: string): number {
  const base = CATEGORY_RATE_BASE[category.trim()] ?? 449;
  const jitter = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 141;
  return base + jitter;
}

export function formatHourlyRateInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}/hr`;
}

export function mockPhoneForProviderId(id: string): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h) % 1000000000;
  const ten = String(9000000000 + n).slice(0, 10);
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

export type ProviderDetailMock = {
  id: string;
  name: string;
  description: string;
  slots: string[];
  hourlyRate: number;
  phone: string;
};

export const MOCK_PROVIDER_DETAILS: Record<string, ProviderDetailMock> = {
  '1': {
    id: '1',
    name: 'Pro Help Desk',
    description:
      'Reliable onsite support for homes and offices. We handle scheduling, equipment checks, and same-day fixes when available. Book a slot and a vetted pro will confirm within minutes.',
    slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:30 PM', '4:15 PM', '5:00 PM'],
    hourlyRate: 489,
    phone: '+91 98204 55118',
  },
  '2': {
    id: '2',
    name: 'Neighborhood Pros',
    description:
      'Local specialists with transparent pricing and a 4.9 average rating. Great for repeat visits and annual maintenance. Tell us what you need—we match you with the right pro.',
    slots: ['9:00 AM', '10:30 AM', '1:00 PM', '2:45 PM', '4:00 PM'],
    hourlyRate: 559,
    phone: '+91 98102 88734',
  },
  '3': {
    id: '3',
    name: 'Slotify Partner',
    description:
      'Official Slotify partner network: background-checked, insured, and trained on our service standards. Ideal for urgent jobs and weekend appointments.',
    slots: ['8:00 AM', '9:30 AM', '11:15 AM', '12:45 PM', '3:00 PM', '5:30 PM', '6:00 PM'],
    hourlyRate: 629,
    phone: '+91 98700 33426',
  },
};

const DEFAULT_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

export function getProviderDetail(id: string, fallbackName?: string, categoryHint?: string): ProviderDetailMock {
  const found = MOCK_PROVIDER_DETAILS[id];
  if (found) return found;
  const listed = findListedProviderById(id);
  if (listed) {
    return {
      id: listed.id,
      name: listed.name,
      description: `${listed.name} offers ${listed.category} on Slotify — background-checked, insured partners where applicable. Read reviews, pick a slot, and we’ll confirm your booking. Ideal for repeat visits and one-off jobs alike.`,
      slots: DEFAULT_SLOTS,
      hourlyRate: hourlyRateForProvider(listed.id, listed.category),
      phone: mockPhoneForProviderId(listed.id),
    };
  }
  const cat = categoryHint?.trim() ?? 'Handyman';
  const pid = id || 'unknown';
  return {
    id,
    name: fallbackName ?? 'Provider',
    description:
      'Details for this provider will appear here once loaded from your backend. Add photos and longer bios later.',
    slots: DEFAULT_SLOTS,
    hourlyRate: hourlyRateForProvider(pid, cat),
    phone: mockPhoneForProviderId(pid),
  };
}
