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

export interface Transaction {
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
  commission?: number;
  date: Date;
  completionDate?: Date;
  paymentMethod: string;
  notes?: string;
} 