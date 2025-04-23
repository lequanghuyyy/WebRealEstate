export interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'user';
  phone?: string;
  bio?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string | Date;
  lastLogin?: string | Date;
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  agentInfo?: {
    licenseNumber?: string;
    agency?: string;
    averageRating?: number;
    listings?: number;
    sales?: number;
  };
} 