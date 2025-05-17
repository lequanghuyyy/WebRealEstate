import { Transaction } from './transaction.model';

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum TransactionStyle {
  RENT = 'RENT',
  SALE = 'SALE'
}

export interface PaymentRequest {
  transactionId: string;
  amount: number;
  paymentMethod: string; // Will be one of PaymentMethod
  commissionFee: number;
  notes: string;
  transactionStyle: TransactionStyle;
  agentId: string;
}

export interface PaymentResponse {
  id: string;
  transactionId: string;
  agentId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  commissionFee: number;
  notes: string;
  createdAt: string;
  transactionStyle: TransactionStyle;
}

export interface PaymentDialogData {
  transaction: Transaction;
  transactionStyle: TransactionStyle;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  commissionFee: number;
  notes?: string;
  createdAt: string;
  transactionStyle: TransactionStyle;
  
  // Legacy fields for compatibility with existing components
  status?: string;
  paymentType?: string;
  method?: string;
  date?: string;
  propertyId?: string;
  propertyTitle?: string;
  payerId?: string;
  payerName?: string;
  recipientId?: string;
  recipientName?: string;
  reference?: string;
} 