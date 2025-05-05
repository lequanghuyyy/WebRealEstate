export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface AppointmentRequest {
  id?: string;
  brId: string;
  agentId: string;
  listingId: string;
  status?: AppointmentStatus;
  day: Date;
  time: string;
  brNote?: string;
  agentNote?: string;
}

export interface AppointmentResponse {
  id: string;
  brId: string;
  agentId: string;
  listingId: string;
  status: AppointmentStatus;
  day: string;
  time: string;
  brNote?: string;
  agentNote?: string;
  createdAt: string;
  updatedAt: string;
  
  // Added for frontend compatibility
  propertyTitle?: string;
  propertyImage?: string;
  agentName?: string;
  buyerName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

export interface FavoriteRequest {
  userId: string;
  listingId: string;
}

export interface FavoriteResponse {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface RecentlyViewedRequest {
  userId: string;
  listingId: string;
}

export interface RecentlyViewedResponse {
  id: string;
  userId: string;
  listingId: string;
  viewedAt: string;
}

export interface ReviewRequest {
  listingId: string;
  brId: string;
  title?: string;
  contentReview?: string;
  rate: number;
}

export interface ReviewResponse {
  id: string;
  listingId: string;
  brId: string;
  title?: string;
  contentReview?: string;
  rate: number;
  countLike: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedSearchRequest {
  userId: string;
  keyword: string;
  minPrice: string | number;
  maxPrice: string | number;
  bedrooms: number;
  type: string; // SALE or RENT
}

export interface SavedSearchResponse {
  id: string;
  userId: string;
  keyword: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  type: string;
  createdAt: string;
}

export interface RecommendationResponse {
  id: string;
  userId: string;
  listingId: string;
  score: number;
  reason: string;
}

export interface BaseResponse<T> {
  status: string;
  description: string;
  data: T;
} 