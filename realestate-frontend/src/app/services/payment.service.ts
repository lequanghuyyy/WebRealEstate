import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Payment, 
  PaymentRequest, 
  PaymentResponse,
  PaymentMethod,
  PaymentStatus,
  TransactionStyle 
} from '../models/payment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Process payment
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    // Make sure agentId is included
    if (!request.agentId) {
      const currentUser = this.authService.getCurrentUser();
      request.agentId = currentUser?.id || '';
    }

    return this.http.post<any>(`${this.apiUrl}/process`, request).pipe(
      map(response => response.data),
      tap(payment => console.log('Created payment:', payment)),
      catchError(error => {
        console.error('Error processing payment:', error);
        return throwError(() => error);
      })
    );
  }

  // Get payment by transaction ID
  getPaymentByTransactionId(transactionId: string): Observable<PaymentResponse> {
    return this.http.get<any>(`${this.apiUrl}/find/${transactionId}`).pipe(
      map(response => response.data),
      tap(payment => console.log('Found payment:', payment)),
      catchError(error => {
        console.error('Error getting payment:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Get all payments for a specific agent with pagination
  getAgentPayments(agentId?: string, page: number = 0): Observable<any> {
    // If no agentId is provided, get current user's ID
    if (!agentId) {
      const currentUser = this.authService.getCurrentUser();
      agentId = currentUser?.id || '';
    }

    return this.http.get<any>(`${this.apiUrl}/find/${agentId}/${page}`).pipe(
      map(response => response.data),
      tap(paymentsPage => console.log('Found agent payments:', paymentsPage)),
      catchError(error => {
        console.error('Error getting agent payments:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all payments with pagination (for admin)
  getAllPayments(page: number = 0): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${page}`).pipe(
      map(response => response.data),
      tap(paymentsPage => console.log('Found all payments:', paymentsPage)),
      catchError(error => {
        console.error('Error getting all payments:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Helper method to convert PaymentResponse to Payment interface
  private mapResponseToPayment(response: PaymentResponse): Payment {
    return {
      id: response.id,
      transactionId: response.transactionId,
      amount: response.amount,
      paymentMethod: response.paymentMethod as PaymentMethod,
      paymentStatus: response.paymentStatus as PaymentStatus,
      paymentDate: response.paymentDate,
      commissionFee: response.commissionFee,
      notes: response.notes,
      createdAt: response.createdAt,
      transactionStyle: response.transactionStyle,
      
      // Map to legacy fields for compatibility
      status: response.paymentStatus.toLowerCase(),
      paymentType: response.transactionStyle === TransactionStyle.SALE ? 'full' : 'installment',
      method: response.paymentMethod.toLowerCase().replace('_', ' '),
      date: response.paymentDate
    };
  }

  // Legacy methods to maintain compatibility with existing components
  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapResponseToPayment(response.data)),
      catchError(error => {
        console.error('Error getting payment by ID:', error);
        return throwError(() => error);
      })
    );
  }

  createPayment(payment: Omit<Payment, 'id'>): Observable<Payment> {
    // Convert to the new request format
    const currentUser = this.authService.getCurrentUser();
    const request: PaymentRequest = {
      transactionId: payment.transactionId || '',
      amount: payment.amount,
      paymentMethod: payment.paymentMethod.toString(),
      commissionFee: payment.commissionFee,
      notes: payment.notes || '',
      transactionStyle: payment.transactionStyle,
      agentId: currentUser?.id || ''
    };
    
    return this.processPayment(request).pipe(
      map(response => this.mapResponseToPayment(response))
    );
  }

  updatePayment(payment: Partial<Payment> & { id: string }): Observable<Payment> {
    return this.http.put<any>(`${this.apiUrl}/${payment.id}`, payment).pipe(
      map(response => this.mapResponseToPayment(response.data)),
      catchError(error => {
        console.error('Error updating payment:', error);
        return throwError(() => error);
      })
    );
  }

  deletePayment(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Error deleting payment:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all payments for a user (agent)
  getUserPayments(userId: string): Observable<PaymentResponse[]> {
    return this.getAgentPayments(userId).pipe(
      map(pageData => pageData.content),
      tap(payments => console.log(`Found ${payments.length} payments for user`)),
      catchError(error => {
        console.error('Error getting user payments:', error);
        return throwError(() => error);
      })
    );
  }

  // Update payment status
  updatePaymentStatus(paymentId: string, status: string): Observable<PaymentResponse> {
    return this.http.put<any>(`${this.apiUrl}/update/${paymentId}/${status}`, {}).pipe(
      map(response => response.data),
      tap(payment => console.log('Updated payment status:', payment)),
      catchError(error => {
        console.error('Error updating payment status:', error);
        return throwError(() => error);
      })
    );
  }
} 