export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentType: 'full' | 'installment' | 'commission' | 'fee';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'other';
  date: string;
  transactionId?: string;
  propertyId?: string;
  propertyTitle?: string;
  payerId?: string;
  payerName?: string;
  recipientId?: string;
  recipientName?: string;
  reference?: string;
  notes?: string;
} 