import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionStyle, PaymentRequest } from '../models/payment.model';
import { PaymentDialogComponent, PaymentDialogData } from '../components/payment-dialog';

/**
 * Open a payment dialog for processing a transaction payment
 * @param dialog MatDialog service
 * @param transactionId Transaction ID
 * @param amount Transaction amount
 * @param transactionStyle Transaction style (SALE or RENT)
 * @param commissionFee Optional commission fee (calculated automatically if not provided)
 * @param agentId Optional agent ID (will be retrieved from current user if not provided)
 * @returns Observable that resolves to the payment request when confirmed, or null when canceled
 */
export function openPaymentDialog(
  dialog: MatDialog,
  transactionId: string,
  amount: number,
  transactionStyle: TransactionStyle,
  commissionFee?: number,
  agentId?: string
): Observable<PaymentRequest | undefined> {
  const dialogRef = dialog.open<PaymentDialogComponent, PaymentDialogData, PaymentRequest>(
    PaymentDialogComponent,
    {
      width: '600px',
      disableClose: true,
      data: {
        transactionId,
        amount,
        transactionStyle,
        commissionFee,
        agentId
      }
    }
  );

  return dialogRef.afterClosed();
}

/**
 * Calculate the commission fee based on amount and transaction style
 * @param amount The transaction amount
 * @param style The transaction style (SALE or RENT)
 * @returns The calculated commission fee
 */
export function calculateCommissionFee(amount: number, style: TransactionStyle): number {
  // Default commission rates
  const saleCommissionRate = 0.05; // 5% for sales
  const rentCommissionRate = 0.10; // 10% for rentals
  
  if (style === TransactionStyle.SALE) {
    return amount * saleCommissionRate;
  } else {
    return amount * rentCommissionRate;
  }
} 