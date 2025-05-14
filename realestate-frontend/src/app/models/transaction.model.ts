export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RentalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Detailed Transaction interface with all properties needed for admin components
export interface DetailedTransaction {
  id: string | number;
  propertyId: string | number;
  propertyTitle: string;
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  transactionType: 'sale' | 'rent';
  amount: number;
  status: string; // Use TransactionStatus or RentalStatus depending on transactionType
  buyerId: string | number;
  buyerName: string;
  sellerId: string | number;
  sellerName: string;
  agentId?: string | number;
  agentName?: string;
  date: Date;
  completionDate?: Date;
  paymentMethod: string;
  notes?: string;
}

// Transaction interface used in services and components
export interface Transaction {
  id?: string | number;
  type: string;
  amount: number;
  status: string;
  paymentStatus: string;
  date: string;
  property: {
    id: string | number;
    title: string;
    image: string;
  };
  client: {
    name: string;
    email: string;
  };
  // Additional properties needed by admin component
  propertyId?: string | number;
  propertyTitle?: string;
  propertyType?: string;
  transactionType?: string;
  buyerId?: string | number;
  buyerName?: string;
  sellerId?: string | number;
  sellerName?: string;
  agentId?: string | number;
  agentName?: string;
  completionDate?: Date;
  paymentMethod?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  commissionFee?: number;
}

// Sales Transaction API interfaces
export interface SalesTransactionRequest {
  listingId: string;
  buyerId: string;
  agentId: string;
  amount: number;
  transactionStatus: string;
}

export interface SalesTransactionResponse {
  id: string;
  listingId: string;
  buyerId: string;
  agentId: string;
  amount: number;
  transactionStatus: string;
  completedAt: string;
  createdAt: string;
}

// Rental Transaction API interfaces
export interface RentalTransactionRequest {
  listingId: string;
  renterId: string;
  agentId: string;
  status: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
}

export interface RentalTransactionResponse {
  id: string;
  listingId: string;
  renterId: string;
  agentId: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface StatusUpdateRequest {
  status: string;
}

export interface PageRequest {
  page: number;
  size: number;
}

export interface PageSalesTransactionRequest {
  page: number;
  size: number;
}

export interface PageRentalTransactionRequest {
  page: number;
  size: number;
}

export interface PageDto<T> {
  items: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
} 