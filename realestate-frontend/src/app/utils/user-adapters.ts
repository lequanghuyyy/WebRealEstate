import { UserResponse } from '../models/auth.model';
export class UserAdapters {
  
  static toPropertyAgent(user: UserResponse | null): {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    photo: string;
    title?: string;
  } | undefined {
    if (!user) return undefined;
    
    return {
      id: user.id,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      email: user.email,
      phone: user.phone || '(Not provided)',
      photo: user.photo || 'assets/images/default-avatar.jpg',
      title: 'Real Estate Agent'
    };
  }
} 