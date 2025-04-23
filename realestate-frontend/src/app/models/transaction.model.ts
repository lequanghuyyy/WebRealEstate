export interface Transaction {
  id: string | number;
  propertyId: string | number;
  propertyTitle: string;
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  transactionType: 'sale' | 'rent';
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
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