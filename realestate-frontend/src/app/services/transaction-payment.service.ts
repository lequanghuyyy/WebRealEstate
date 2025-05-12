import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { TransactionService } from './transaction.service';
import { PaymentService } from './payment.service';
import { AuthService } from './auth.service';
import { 
  SalesTransactionRequest, 
  SalesTransactionResponse,
  RentalTransactionRequest,
  RentalTransactionResponse 
} from '../models/transaction.model';
import { 
  PaymentRequest, 
  PaymentResponse, 
  TransactionStyle 
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionPaymentService {
  
  constructor(
    private transactionService: TransactionService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) { }

  /**
   * Process a sales transaction with payment
   * @param transactionRequest The sales transaction request
   * @param paymentRequest The payment request (optional, will be generated if not provided)
   */
  processSalesTransaction(
    transactionRequest: SalesTransactionRequest, 
    paymentRequest?: Partial<PaymentRequest>
  ): Observable<{transaction: SalesTransactionResponse, payment: PaymentResponse}> {
    const currentUser = this.authService.getCurrentUser();
    const agentId = currentUser?.id || transactionRequest.agentId || '';
    
    return this.transactionService.createSalesTransaction(transactionRequest).pipe(
      switchMap(transaction => {
        // Create a payment request using the transaction data
        const request: PaymentRequest = {
          transactionId: transaction.id,
          amount: transaction.amount,
          paymentMethod: paymentRequest?.paymentMethod || 'BANK_TRANSFER',
          commissionFee: this.calculateCommission(transaction.amount, TransactionStyle.SALE),
          notes: paymentRequest?.notes || `Payment for sales transaction ${transaction.id}`,
          transactionStyle: TransactionStyle.SALE,
          agentId: paymentRequest?.agentId || agentId
        };
        
        return this.paymentService.processPayment(request).pipe(
          map(payment => ({ transaction, payment }))
        );
      }),
      catchError(error => {
        console.error('Error processing sales transaction with payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Process a rental transaction with payment
   * @param transactionRequest The rental transaction request
   * @param paymentRequest The payment request (optional, will be generated if not provided)
   */
  processRentalTransaction(
    transactionRequest: RentalTransactionRequest,
    paymentRequest?: Partial<PaymentRequest>
  ): Observable<{transaction: RentalTransactionResponse, payment: PaymentResponse}> {
    const currentUser = this.authService.getCurrentUser();
    const agentId = currentUser?.id || transactionRequest.agentId || '';
    
    return this.transactionService.createRentalTransaction(transactionRequest).pipe(
      switchMap(transaction => {
        // Create a payment request using the transaction data
        const request: PaymentRequest = {
          transactionId: transaction.id,
          amount: transaction.monthlyRent,
          paymentMethod: paymentRequest?.paymentMethod || 'BANK_TRANSFER',
          commissionFee: this.calculateCommission(transaction.monthlyRent, TransactionStyle.RENT),
          notes: paymentRequest?.notes || `Payment for rental transaction ${transaction.id}`,
          transactionStyle: TransactionStyle.RENT,
          agentId: paymentRequest?.agentId || agentId
        };
        
        return this.paymentService.processPayment(request).pipe(
          map(payment => ({ transaction, payment }))
        );
      }),
      catchError(error => {
        console.error('Error processing rental transaction with payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a transaction and its associated payment
   * @param transactionId The transaction ID
   * @param isRental Whether the transaction is a rental or a sale
   */
  getTransactionWithPayment(
    transactionId: string,
    isRental: boolean = false
  ): Observable<{transaction: SalesTransactionResponse | RentalTransactionResponse, payment: PaymentResponse}> {
    
    // Create an observable for the transaction retrieval based on type
    let getTransaction$: Observable<SalesTransactionResponse | RentalTransactionResponse>;
    
    if (isRental) {
      getTransaction$ = this.transactionService.getRentalTransactionById(transactionId);
    } else {
      getTransaction$ = this.transactionService.getSalesTransactionById(transactionId);
    }

    // Combine transaction with payment data
    return getTransaction$.pipe(
      switchMap((transaction: SalesTransactionResponse | RentalTransactionResponse) => {
        return this.paymentService.getPaymentByTransactionId(transactionId).pipe(
          map((payment: PaymentResponse) => {
            return { 
              transaction, 
              payment 
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error getting transaction with payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Calculate commission based on transaction amount and type
   * @param amount The transaction amount
   * @param style The transaction style (SALE or RENT)
   */
  private calculateCommission(amount: number, style: TransactionStyle): number {
    // Default commission rates
    const saleCommissionRate = 0.05; // 5% for sales
    const rentCommissionRate = 0.10; // 10% for rentals
    
    if (style === TransactionStyle.SALE) {
      return amount * saleCommissionRate;
    } else {
      return amount * rentCommissionRate;
    }
  }
} 