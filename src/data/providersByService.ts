export type ListedServiceProvider = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
};

function p(
  id: string,
  name: string,
  category: string,
  image: string,
  rating: number,
): ListedServiceProvider {
  return { id, name, category, image, rating };
}

export const PROVIDERS_BY_SERVICE: Record<string, ListedServiceProvider[]> = {
  Cleaning: [
    p('sp-clean-1', 'Rahul Sharma', 'Cleaning', 'https://randomuser.me/api/portraits/men/11.jpg', 4.7),
    p('sp-clean-2', 'Kavita Bose', 'Cleaning', 'https://randomuser.me/api/portraits/women/21.jpg', 4.9),
    p('sp-clean-3', 'Imran Qureshi', 'Cleaning', 'https://randomuser.me/api/portraits/men/18.jpg', 4.5),
  ],
  Electrician: [
    p('sp-elec-1', 'Priya Nair', 'Electrician', 'https://randomuser.me/api/portraits/women/32.jpg', 4.8),
    p('sp-elec-2', 'Sanjay Kulkarni', 'Electrician', 'https://randomuser.me/api/portraits/men/25.jpg', 4.6),
    p('sp-elec-3', 'Fatima Syed', 'Electrician', 'https://randomuser.me/api/portraits/women/45.jpg', 5.0),
  ],
  Carpenter: [
    p('sp-carp-1', 'Arjun Mehta', 'Carpenter', 'https://randomuser.me/api/portraits/men/33.jpg', 4.6),
    p('sp-carp-2', 'Lakshmi Venkat', 'Carpenter', 'https://randomuser.me/api/portraits/women/38.jpg', 4.8),
    p('sp-carp-3', 'Harish Pillai', 'Carpenter', 'https://randomuser.me/api/portraits/men/41.jpg', 4.4),
  ],
  Plumbing: [
    p('sp-plum-1', 'Vikram Singh', 'Plumbing', 'https://randomuser.me/api/portraits/men/52.jpg', 4.5),
    p('sp-plum-2', 'Deepika Rao', 'Plumbing', 'https://randomuser.me/api/portraits/women/55.jpg', 4.9),
    p('sp-plum-3', 'Manoj Patil', 'Plumbing', 'https://randomuser.me/api/portraits/men/58.jpg', 4.3),
  ],
  Painting: [
    p('sp-paint-1', 'Ananya Iyer', 'Painting', 'https://randomuser.me/api/portraits/women/62.jpg', 4.7),
    p('sp-paint-2', 'Rohit Chauhan', 'Painting', 'https://randomuser.me/api/portraits/men/64.jpg', 4.6),
    p('sp-paint-3', 'Nisha Agarwal', 'Painting', 'https://randomuser.me/api/portraits/women/67.jpg', 4.8),
  ],
  'Hair salon': [
    p('sp-salon-1', 'Aditya Khanna', 'Hair salon', 'https://randomuser.me/api/portraits/men/72.jpg', 4.8),
    p('sp-salon-2', 'Riya Malhotra', 'Hair salon', 'https://randomuser.me/api/portraits/women/74.jpg', 4.9),
    p('sp-salon-3', 'Chris Dsouza', 'Hair salon', 'https://randomuser.me/api/portraits/men/76.jpg', 4.5),
  ],
  'Smart home': [
    p('sp-smart-1', 'Divya Menon', 'Smart home', 'https://randomuser.me/api/portraits/women/79.jpg', 4.9),
    p('sp-smart-2', 'Neil Joshi', 'Smart home', 'https://randomuser.me/api/portraits/men/81.jpg', 4.7),
    p('sp-smart-3', 'Aisha Khan', 'Smart home', 'https://randomuser.me/api/portraits/women/84.jpg', 4.6),
  ],
  'TV repair': [
    p('sp-tv-1', 'Sneha Reddy', 'TV repair', 'https://randomuser.me/api/portraits/women/86.jpg', 4.9),
    p('sp-tv-2', 'Tarun Bhatt', 'TV repair', 'https://randomuser.me/api/portraits/men/88.jpg', 4.5),
    p('sp-tv-3', 'Pooja Sen', 'TV repair', 'https://randomuser.me/api/portraits/women/90.jpg', 4.7),
  ],
  Handyman: [
    p('sp-hand-1', 'Karan Desai', 'Handyman', 'https://randomuser.me/api/portraits/men/91.jpg', 4.4),
    p('sp-hand-2', 'Meera Kapoor', 'Handyman', 'https://randomuser.me/api/portraits/women/93.jpg', 4.8),
    p('sp-hand-3', 'Varun Thakur', 'Handyman', 'https://randomuser.me/api/portraits/men/95.jpg', 4.6),
  ],
};

const MORE_PROVIDERS: ListedServiceProvider[] = [
  p('sp-more-1', 'Ishita Ghosh', 'Cleaning', 'https://randomuser.me/api/portraits/women/12.jpg', 4.7),
  p('sp-more-2', 'Arvind Menon', 'Electrician', 'https://randomuser.me/api/portraits/men/14.jpg', 4.6),
  p('sp-more-3', 'Simran Kaur', 'Plumbing', 'https://randomuser.me/api/portraits/women/19.jpg', 4.8),
  p('sp-more-4', 'Omar Farooq', 'Carpenter', 'https://randomuser.me/api/portraits/men/27.jpg', 4.5),
];

const ALL_LISTED: ListedServiceProvider[] = [
  ...Object.values(PROVIDERS_BY_SERVICE).flat(),
  ...MORE_PROVIDERS,
];

export function findListedProviderById(id: string): ListedServiceProvider | undefined {
  return ALL_LISTED.find((x) => x.id === id);
}

export function getProvidersForServiceLabel(serviceLabel: string): ListedServiceProvider[] {
  const trimmed = serviceLabel.trim();
  if (trimmed === 'More') return MORE_PROVIDERS;
  const list = PROVIDERS_BY_SERVICE[trimmed];
  if (list?.length) return list;
  return MORE_PROVIDERS;
}
