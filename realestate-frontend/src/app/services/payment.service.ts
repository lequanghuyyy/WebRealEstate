import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
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
import { ListingType, ListingStatus, ListingStatusUpdateRequest } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private listingApiUrl = `${environment.apiUrl}/listings`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Process payment
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
   
    return this.http.post<any>(`${this.apiUrl}/process`, request).pipe(
      map(response => response.data),
      tap(payment => console.log('Created payment:', payment)),
      switchMap(payment => {
        // After successful payment, update the property status
        if (payment && payment.transactionId) {
          return this.updatePropertyStatusAfterPayment(payment.transactionId, request.transactionStyle).pipe(
            map(() => payment) // Return the original payment
          );
        }
        return of(payment);
      }),
      catchError(error => {
        console.error('Error processing payment:', error);
        return throwError(() => error);
      })
    );
  }

  // New method to update property status after payment
  private updatePropertyStatusAfterPayment(transactionId: string, transactionStyle: TransactionStyle): Observable<any> {
    console.log(`Updating property status for transaction: ${transactionId}, style: ${transactionStyle}`);
    
    // Determine which endpoint to use based on transaction style (SALE or RENT)
    let apiEndpoint: string;
    if (transactionStyle === TransactionStyle.SALE) {
      apiEndpoint = `${environment.apiUrl}/sales/find/${transactionId}`;
      console.log(`Using sales endpoint: ${apiEndpoint}`);
    } else {
      // For RENT transactions, use the rentals find endpoint from the RentsController
      apiEndpoint = `${environment.apiUrl}/rentals/find/${transactionId}`;
      console.log(`Using rent endpoint: ${apiEndpoint}`);
    }
    
    // Get the transaction to find the property (listing) ID
    return this.http.get<any>(apiEndpoint).pipe(
      map(response => response.data),
      tap(transaction => console.log('Found transaction:', transaction)),
      switchMap(transaction => {
        if (!transaction || !transaction.listingId) {
          console.error('Transaction not found or missing listingId', transaction);
          return of(null);
        }
        
        const listingId = transaction.listingId;
        console.log(`Found listing ID: ${listingId} from transaction`);
        
        // Determine status based on transaction style
        const newStatus: ListingStatus = transactionStyle === TransactionStyle.SALE 
          ? ListingStatus.SOLD 
          : ListingStatus.RENTED;
        
        console.log(`Setting listing status to: ${newStatus}`);
        
        const statusUpdateRequest: ListingStatusUpdateRequest = {
          status: newStatus
        };
        
        // Update the listing status
        return this.http.put<any>(`${this.listingApiUrl}/updateStatus/${listingId}`, statusUpdateRequest).pipe(
          tap(response => console.log('Updated property status:', response)),
          catchError(error => {
            console.error(`Error updating property status for listing ${listingId}:`, error);
            return of(null);
          })
        );
      }),
      catchError(error => {
        console.error(`Error finding transaction with ID ${transactionId}:`, error);
        return of(null);
      })
    );
  }

  // Get payment by transaction ID
  getPaymentByTransactionId(transactionId: string): Observable<PaymentResponse> {
    return this.http.get<any>(`${this.apiUrl}/find/${transactionId}`).pipe(
      map(response => {
        console.log('Raw payment response:', response);
        // Check if notes field exists
        if (response.data && !response.data.notes) {
          console.warn('Notes field is missing in payment data');
        }
        return response.data;
      }),
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
      agentId: response.agentId,
      buyerId: response.buyerId,
      
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
    const request: PaymentRequest = {
      transactionId: payment.transactionId || '',
      amount: payment.amount,
      paymentMethod: payment.paymentMethod.toString(),
      commissionFee: payment.commissionFee,
      notes: payment.notes || '',
      transactionStyle: payment.transactionStyle,
      agentId: payment.agentId || '',  // Use the provided agentId from the transaction
      buyerId: payment.buyerId
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

  // Get all payments for an agent
  getPaymentsByAgent(agentId: string, page: number = 0): Observable<PaymentResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/find/${agentId}/${page}`).pipe(
      map(response => response.data.content),
      catchError(error => {
        console.error('Error getting payments by agent:', error);
        return of([]);
      })
    );
  }

  // Calculate commission fee
  calculateCommissionFee(style: TransactionStyle): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/commission/${style}`).pipe(
      map(response => parseFloat(response.data)),
      catchError(error => {
        console.error('Error calculating commission fee:', error);
        // Fallback to local calculation
        return of(style === TransactionStyle.SALE ? 0.03 : 0.05);
      })
    );
  }

  // Export payments to file (CSV or PDF)
  exportPaymentsToFile(payments: PaymentResponse[] | Payment[], fileType: 'csv' | 'pdf'): void {
    if (fileType === 'csv') {
      this.exportPaymentsToCSV(payments);
    } else if (fileType === 'pdf') {
      this.exportPaymentsToPDF(payments);
    }
  }

  // Export payments to CSV
  private exportPaymentsToCSV(payments: PaymentResponse[] | Payment[]): void {
    // Define CSV headers
    const headers = [
      'ID', 'Transaction ID', 'Amount', 'Payment Method', 'Payment Status', 
      'Payment Date', 'Commission Fee', 'Transaction Type', 'Notes'
    ];

    // Convert payments to CSV rows
    const csvRows = [
      headers.join(','),
      ...payments.map(payment => {
        // Use type guards to determine which interface we're dealing with
        const isPaymentResponse = 'paymentMethod' in payment && typeof payment.paymentMethod === 'string';
        const isPayment = 'method' in payment;
        
        // Get payment method based on type
        let paymentMethod: string;
        if (isPaymentResponse) {
          paymentMethod = payment.paymentMethod;
        } else if (isPayment) {
          paymentMethod = (payment as Payment).method || '';
        } else {
          paymentMethod = '';
        }
        
        // Get payment status based on type
        let paymentStatus: string;
        if (isPaymentResponse) {
          paymentStatus = payment.paymentStatus;
        } else if (isPayment) {
          paymentStatus = (payment as Payment).status || '';
        } else {
          paymentStatus = '';
        }
        
        // Get transaction type based on type
        let transactionType: string;
        if (isPaymentResponse) {
          transactionType = payment.transactionStyle;
        } else if (isPayment) {
          transactionType = (payment as Payment).paymentType || '';
        } else {
          transactionType = '';
        }
        
        // Get payment date based on type
        let paymentDate: string;
        if (isPaymentResponse) {
          paymentDate = payment.paymentDate;
        } else if (isPayment) {
          paymentDate = (payment as Payment).date || '';
        } else {
          paymentDate = '';
        }

        return [
          payment.id,
          payment.transactionId,
          payment.amount,
          paymentMethod,
          paymentStatus,
          paymentDate,
          payment.commissionFee,
          transactionType,
          `"${(payment.notes || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    this.downloadFile(csvContent, 'payments.csv', 'text/csv');
  }

  // Export payments to PDF
  private exportPaymentsToPDF(payments: PaymentResponse[] | Payment[]): void {
    // For PDF exports, we might need a library like jspdf and jspdf-autotable
    // This is a simplified implementation
    alert('PDF export would be implemented here - requires additional PDF libraries');
    
    // Example implementation would be:
    // 1. Create a PDF document using jspdf
    // 2. Add a table with payment data using jspdf-autotable
    // 3. Save the PDF file
  }

  // Generic file download function
  private downloadFile(content: string, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
} 