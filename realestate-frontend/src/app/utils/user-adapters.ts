import { UserResponse } from '../models/auth.model';

/**
 * Utility class to adapt UserResponse objects to the format needed for other parts of the app
 */
export class UserAdapters {
  
  /**
   * Transforms a UserResponse to the format needed for the Property agent field
   */
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