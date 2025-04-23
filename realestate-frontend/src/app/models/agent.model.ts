export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  title: string;
  bio: string;
  licenseNumber: string;
  agency: string;
  specializations: string[];
  areas: string[];
  languages: string[];
  averageRating: number;
  reviewCount: number;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  availableHours: string;
} 