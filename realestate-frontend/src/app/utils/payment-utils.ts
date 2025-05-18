import { TransactionStyle, PaymentRequest, PaymentMethod } from '../models/payment.model';

export function calculateCommissionFee(amount: number, style: TransactionStyle): number {
  const saleCommissionRate = 0.05;
  const rentCommissionRate = 0.10; 
  
  if (style === TransactionStyle.SALE) {
    return amount * saleCommissionRate;
  } else {
    return amount * rentCommissionRate;
  }
}

export function createPaymentRequest(
  transactionId: string,
  amount: number,
  transactionStyle: TransactionStyle,
  paymentMethod: PaymentMethod = PaymentMethod.BANK_TRANSFER,
  notes: string = '',
  commissionFee?: number,
  agentId?: string,
  buyerId?: string
): PaymentRequest {
  if (!commissionFee) {
    commissionFee = calculateCommissionFee(amount, transactionStyle);
  }
  
  return {
    transactionId,
    amount,
    paymentMethod,
    transactionStyle,
    notes,
    commissionFee,
    agentId: agentId || '',
    buyerId
  };
} 