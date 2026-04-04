/** Shared mock IDs with `ProviderListScreen` — replace with API */

export type ProviderListRow = { id: string; name: string; subtitle: string };

export function mockProvidersForService(serviceLabel: string): ProviderListRow[] {
  return [
    { id: '1', name: 'Pro Help Desk', subtitle: `${serviceLabel} · Verified` },
    { id: '2', name: 'Neighborhood Pros', subtitle: `${serviceLabel} · Top rated` },
    { id: '3', name: 'Slotify Partner', subtitle: `${serviceLabel} · Fast response` },
  ];
}

export type ProviderDetailMock = {
  id: string;
  name: string;
  description: string;
  slots: string[];
};

export const MOCK_PROVIDER_DETAILS: Record<string, ProviderDetailMock> = {
  '1': {
    id: '1',
    name: 'Pro Help Desk',
    description:
      'Reliable onsite support for homes and offices. We handle scheduling, equipment checks, and same-day fixes when available. Book a slot and a vetted pro will confirm within minutes.',
    slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:30 PM', '4:15 PM', '5:00 PM'],
  },
  '2': {
    id: '2',
    name: 'Neighborhood Pros',
    description:
      'Local specialists with transparent pricing and a 4.9 average rating. Great for repeat visits and annual maintenance. Tell us what you need—we match you with the right pro.',
    slots: ['9:00 AM', '10:30 AM', '1:00 PM', '2:45 PM', '4:00 PM'],
  },
  '3': {
    id: '3',
    name: 'Slotify Partner',
    description:
      'Official Slotify partner network: background-checked, insured, and trained on our service standards. Ideal for urgent jobs and weekend appointments.',
    slots: ['8:00 AM', '9:30 AM', '11:15 AM', '12:45 PM', '3:00 PM', '5:30 PM', '6:00 PM'],
  },
};

const DEFAULT_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];

export function getProviderDetail(id: string, fallbackName?: string): ProviderDetailMock {
  const found = MOCK_PROVIDER_DETAILS[id];
  if (found) return found;
  return {
    id,
    name: fallbackName ?? 'Provider',
    description:
      'Details for this provider will appear here once loaded from your backend. Add photos and longer bios later.',
    slots: DEFAULT_SLOTS,
  };
}
