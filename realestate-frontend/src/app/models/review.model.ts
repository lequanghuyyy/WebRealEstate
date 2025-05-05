export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  date: Date;
  userName: string;
  userAvatar?: string;
  helpful: number; // số người thấy hữu ích
  helpfulCount?: number; // alias for helpful to maintain compatibility
} 