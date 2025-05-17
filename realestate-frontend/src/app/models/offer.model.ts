export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface OfferRequest {
  listingId: string;
  userId: string;
  offerPrice: number;
  expiresAt: string;
  message?: string;
  startRentAt?: string;
  endRentAt?: string;
}

export interface OfferResponse {
  id: string;
  listingId: string;
  userId: string;
  agentId: string;
  offerPrice: number;
  expiresAt: string;
  status: OfferStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferWithDetails extends OfferResponse {
  propertyTitle?: string;
  propertyImage?: string;
  buyerName?: string;
  agentName?: string;
  propertyType?: string;
}

export interface BaseResponse<T> {
  status: string;
  description: string;
  data: T;
} 