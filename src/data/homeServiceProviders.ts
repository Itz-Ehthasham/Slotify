export type HomeServiceProvider = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
};

export const HOME_SERVICE_PROVIDERS: HomeServiceProvider[] = [
  {
    id: 'h1',
    name: 'Rahul Sharma',
    category: 'Cleaning',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 4.5,
  },
  {
    id: 'h2',
    name: 'Priya Nair',
    category: 'Electrician',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 4.8,
  },
  {
    id: 'h3',
    name: 'Arjun Mehta',
    category: 'Carpenter',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.6,
  },
  {
    id: 'h4',
    name: 'Sneha Reddy',
    category: 'Repairing',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.9,
  },
  {
    id: 'h5',
    name: 'Vikram Singh',
    category: 'Plumbing',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 4.4,
  },
  {
    id: 'h6',
    name: 'Ananya Iyer',
    category: 'Painting',
    image: 'https://randomuser.me/api/portraits/women/17.jpg',
    rating: 4.7,
  },
  {
    id: 'h7',
    name: 'Karan Desai',
    category: 'AC & HVAC',
    image: 'https://randomuser.me/api/portraits/men/15.jpg',
    rating: 4.3,
  },
  {
    id: 'h8',
    name: 'Meera Kapoor',
    category: 'Gardening',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5.0,
  },
];
