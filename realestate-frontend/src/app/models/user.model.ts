export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: string;
  roles?: string[];
  phone?: string;
  bio?: string;
  status: string;
  createdAt: string | Date;
  createAt?: string;
  photo?: string;
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