import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'INR') {
  // Supabase stores absolute INR (8500000 = ₹85 Lakhs)
  if (currency === 'INR' || currency === '₹') {
    if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`;
    if (price >= 100_000) return `₹${(price / 100_000).toFixed(price % 100_000 === 0 ? 0 : 1)} Lakhs`;
    return `₹${price.toLocaleString('en-IN')}`;
  }
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `${currency} ${(price / 1_000).toFixed(0)}K`;
  return `${currency} ${price.toLocaleString()}`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

// Demo properties data
export const demoProperties = [
  {
    id: '1',
    title: 'Burj Vista Penthouse',
    description: 'Ultra-luxury penthouse with panoramic Burj Khalifa views. Full smart home integration, private pool, and concierge service.',
    country: 'UAE',
    city: 'Dubai',
    area: 'Downtown Dubai',
    property_type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 6500,
    price: 12500000,
    currency: 'AED',
    investment_score: 94,
    rental_yield: 7.2,
    featured: true,
    status: 'available',
  },
  {
    id: '2',
    title: 'Palm Jumeirah Sea Villa',
    description: 'Beachfront villa on the iconic Palm Jumeirah with private beach access, infinity pool and stunning Arabian Gulf views.',
    country: 'UAE',
    city: 'Dubai',
    area: 'Palm Jumeirah',
    property_type: 'Villa',
    bedrooms: 6,
    bathrooms: 7,
    area_sqft: 9200,
    price: 28000000,
    currency: 'AED',
    investment_score: 91,
    rental_yield: 5.8,
    featured: true,
    status: 'available',
  },
  {
    id: '3',
    title: 'DIFC Sky Apartment',
    description: 'Premium apartment in the heart of financial district. Floor-to-ceiling windows, chef kitchen, and rooftop access.',
    country: 'UAE',
    city: 'Dubai',
    area: 'DIFC',
    property_type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2800,
    price: 4200000,
    currency: 'AED',
    investment_score: 88,
    rental_yield: 8.1,
    featured: false,
    status: 'available',
  },
  {
    id: '4',
    title: 'Marina Gate Tower',
    description: 'Modern apartment with marina views. Premium finishes, gym, spa and 24/7 concierge.',
    country: 'UAE',
    city: 'Dubai',
    area: 'Dubai Marina',
    property_type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1650,
    price: 2100000,
    currency: 'AED',
    investment_score: 85,
    rental_yield: 9.2,
    featured: true,
    status: 'available',
  },
  {
    id: '5',
    title: 'Jumeirah Golf Estate Villa',
    description: 'Sprawling golf-course villa with 7 bedrooms, home theater, wine cellar and dedicated staff quarters.',
    country: 'UAE',
    city: 'Dubai',
    area: 'Jumeirah Golf Estates',
    property_type: 'Villa',
    bedrooms: 7,
    bathrooms: 8,
    area_sqft: 12000,
    price: 45000000,
    currency: 'AED',
    investment_score: 89,
    rental_yield: 4.5,
    featured: false,
    status: 'available',
  },
  {
    id: '6',
    title: 'Creek Harbour Residence',
    description: 'Off-plan luxury apartment in Dubai\'s newest waterfront district. High ROI potential with early investor pricing.',
    country: 'UAE',
    city: 'Dubai',
    area: 'Dubai Creek Harbour',
    property_type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 850,
    price: 1350000,
    currency: 'AED',
    investment_score: 92,
    rental_yield: 10.5,
    featured: true,
    status: 'off-plan',
  },
];

export const demoAnalytics = {
  totalLeads: 248,
  totalCalls: 892,
  conversions: 47,
  revenue: 142500000,
  leadGrowth: 23,
  callGrowth: 18,
  conversionRate: 18.9,
  avgDealValue: 3031914,
};

export const demoLeads = [
  { id: '1', name: 'Ahmed Al-Rashid', phone_number: '+971501234567', interest: 'Penthouse', budget: 'AED 15M+', status: 'hot', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', name: 'Sarah Mitchell', phone_number: '+447891234567', interest: 'Villa', budget: 'AED 5-10M', status: 'warm', created_at: '2024-01-14T14:20:00Z' },
  { id: '3', name: 'Raj Patel', phone_number: '+919876543210', interest: 'Apartment', budget: 'AED 2-4M', status: 'cold', created_at: '2024-01-13T09:15:00Z' },
  { id: '4', name: 'Emma Johnson', phone_number: '+12125551234', interest: 'Investment', budget: 'AED 8M', status: 'hot', created_at: '2024-01-12T16:45:00Z' },
  { id: '5', name: 'Mohammed Al-Farsi', phone_number: '+971529876543', interest: 'Commercial', budget: 'AED 20M+', status: 'warm', created_at: '2024-01-11T11:00:00Z' },
];

export const demoCallLogs = [
  { id: '1', call_id: 'call_001', phone_number: '+971501234567', duration: 342, summary: 'Interested in Palm Jumeirah villas. Budget AED 15M. Looking for beachfront with private pool. Follow-up scheduled.', sentiment: 'positive', status: 'completed', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', call_id: 'call_002', phone_number: '+447891234567', duration: 215, summary: 'Looking for 3BHK in Downtown Dubai. Investment focused. Asked about rental yields. Interested in off-plan.', sentiment: 'neutral', status: 'completed', created_at: '2024-01-14T14:20:00Z' },
  { id: '3', call_id: 'call_003', phone_number: '+12125551234', duration: 480, summary: 'High net worth investor. Portfolio of 5+ properties. Interested in commercial spaces in DIFC. Escalated to senior agent.', sentiment: 'positive', status: 'escalated', created_at: '2024-01-13T09:15:00Z' },
];

export const demoSiteVisits = [
  { id: '1', lead_name: 'Ahmed Al-Rashid', phone_number: '+971501234567', property_address: 'Palm Jumeirah Sea Villa', visit_date: '2024-01-20', visit_time: '10:00 AM', status: 'confirmed', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', lead_name: 'Sarah Mitchell', phone_number: '+447891234567', property_address: 'Burj Vista Penthouse', visit_date: '2024-01-21', visit_time: '2:00 PM', status: 'pending', created_at: '2024-01-14T14:20:00Z' },
  { id: '3', lead_name: 'Emma Johnson', phone_number: '+12125551234', property_address: 'DIFC Sky Apartment', visit_date: '2024-01-19', visit_time: '11:00 AM', status: 'completed', created_at: '2024-01-12T16:45:00Z' },
];
