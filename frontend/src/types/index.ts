// User Types
export type UserRole = 'renter' | 'owner' | 'both';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joined: string;
  rentals?: number;
  spent?: string;
  listings?: number;
  earned?: string;
  status: UserStatus;
  avatar: string;
}

// Listing Types
export type ListingStatus = 'active' | 'inactive' | 'pending';
export type ListingCategory = 'Electronics' | 'Sports' | 'Outdoors' | 'Tools' | 'Others';

export interface Listing {
  id: string;
  name: string;
  owner: string;
  category: ListingCategory;
  price: string;
  status: ListingStatus;
  rating: number;
  rentals: number;
  created: string;
}

// Rental Types
export type RentalStatus = 'active' | 'completed' | 'pending' | 'cancelled';

export interface Rental {
  id: string;
  item: string;
  renter: string;
  owner: string;
  amount: string;
  status: RentalStatus;
  date: string;
  days: number;
}

// Payment Types
export type PaymentType = 'rental' | 'payout' | 'refund';
export type PaymentStatus = 'completed' | 'pending' | 'processing';

export interface Payment {
  id: string;
  rental: string;
  user: string;
  amount: string;
  type: PaymentType;
  method: string;
  status: PaymentStatus;
  date: string;
}

// Dispute Types
export type DisputeStatus = 'open' | 'investigating' | 'resolved';
export type DisputePriority = 'high' | 'medium' | 'low';

export interface Dispute {
  id: string;
  rental: string;
  item: string;
  renter: string;
  owner: string;
  issue: string;
  status: DisputeStatus;
  priority: DisputePriority;
  date: string;
}

// Stats Types
export interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  color: string;
}

export interface ChartData {
  month: string;
  revenue: number;
}

export interface DonutData {
  label: string;
  value: number;
  color: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

// Notification Types
export interface Notification {
  title: string;
  subtitle: string;
  color: string;
}