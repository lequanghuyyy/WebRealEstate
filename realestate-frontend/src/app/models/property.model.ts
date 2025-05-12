import { Agent } from './agent.model';

export interface Property {
  id: string | number;
  title: string;
  description: string;
  price: number;
  type: string; // 'rent' or 'buy'
  status: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in sq ft
    yearBuilt: number;
    parkingSpaces?: number;
  };
  amenities: string[];
  images: string[];
  agent: Agent;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  // Additional properties
  views?: number; // Property view count
  isFavorite?: boolean; // User favorite status
  isNew?: boolean; // New property flag
} 