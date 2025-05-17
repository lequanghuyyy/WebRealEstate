import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  TransactionStatus, 
  RentalStatus, 
  Transaction,
  SalesTransactionRequest,
  SalesTransactionResponse,
  RentalTransactionRequest,
  RentalTransactionResponse,
  StatusUpdateRequest,
  PageSalesTransactionRequest,
  PageRentalTransactionRequest,
  PageDto
} from '../models/transaction.model';
import { PaymentService } from './payment.service';
import { PaymentRequest, TransactionStyle } from '../models/payment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.apiUrl;
  private salesApiUrl = `${this.apiUrl}/sales`;
  private rentalApiUrl = `${this.apiUrl}/rentals`;

  constructor(
    private http: HttpClient, 
    private paymentService: PaymentService, 
    private authService: AuthService
  ) {
    console.log('API URLs:');
    console.log('Base API URL:', this.apiUrl);
    console.log('Sales API URL:', this.salesApiUrl);
    console.log('Rental API URL:', this.rentalApiUrl);
  }

  // SALES TRANSACTION API METHODS

  // Create a new sales transaction with payment processing
  createSalesTransaction(request: SalesTransactionRequest): Observable<SalesTransactionResponse> {
    const currentUser = this.authService.getCurrentUser();
    const agentId = currentUser?.id || '';
    
    return this.http.post<any>(`${this.salesApiUrl}/create`, request).pipe(
      map(response => response.data),
      tap(transaction => console.log('Created sales transaction:', transaction)),
      switchMap(transaction => {
        // Create a payment record for this transaction
        const paymentRequest: PaymentRequest = {
          transactionId: transaction.id,
          amount: transaction.amount,
          paymentMethod: 'BANK_TRANSFER', // Default payment method
          commissionFee: this.calculateCommission(transaction.amount, TransactionStyle.SALE),
          notes: `Payment for sales transaction ${transaction.id}`,
          transactionStyle: TransactionStyle.SALE,
          agentId: agentId
        };
        
        return this.paymentService.processPayment(paymentRequest).pipe(
          map(() => transaction) // Return the original transaction
        );
      }),
      catchError(error => {
        console.error('Error creating sales transaction with payment:', error);
        throw error;
      })
    );
  }

  // Get a sales transaction by ID
  getSalesTransactionById(transactionId: string): Observable<SalesTransactionResponse> {
    return this.http.get<any>(`${this.salesApiUrl}/${transactionId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting sales transaction:', error);
        throw error;
      })
    );
  }

  // Get all sales transactions with pagination
  getAllSalesTransactions(request: PageSalesTransactionRequest): Observable<PageDto<SalesTransactionResponse>> {
    return this.http.get<any>(`${this.salesApiUrl}/find/${request.page}/${request.size}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting all sales transactions:', error);
        throw error;
      })
    );
  }

  // Get sales transactions by buyer
  getSalesTransactionsByBuyer(buyerId: string): Observable<SalesTransactionResponse[]> {
    return this.http.get<any>(`${this.salesApiUrl}/buyer/${buyerId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting buyer sales transactions:', error);
        throw error;
      })
    );
  }

  getSalesTransactionsByAgent(agentId: string): Observable<SalesTransactionResponse[]> {
    return this.http.get<any>(`${this.salesApiUrl}/agent/${agentId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting agent sales transactions:', error);
        throw error;
      })
    );
  }

  getSalesTransactionsByListing(listingId: string): Observable<SalesTransactionResponse[]> {
    return this.http.get<any>(`${this.salesApiUrl}/listing/${listingId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting listing sales transactions:', error);
        throw error;
      })
    );
  }

  // Update sales transaction status
  updateSalesTransactionStatus(transactionId: string, status: string): Observable<SalesTransactionResponse> {
    const statusRequest: StatusUpdateRequest = { status };
    return this.http.put<any>(`${this.salesApiUrl}/updateStatus/${transactionId}`, statusRequest).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating sales transaction status:', error);
        throw error;
      })
    );
  }

  createRentalTransaction(request: RentalTransactionRequest): Observable<RentalTransactionResponse> {
    const currentUser = this.authService.getCurrentUser();
    const agentId = currentUser?.id || '';
    
    return this.http.post<any>(`${this.rentalApiUrl}/create`, request).pipe(
      map(response => response.data),
      tap(transaction => console.log('Created rental transaction:', transaction)),
      switchMap(transaction => {
        const paymentRequest: PaymentRequest = {
          transactionId: transaction.id,
          amount: transaction.monthlyRent,
          paymentMethod: 'BANK_TRANSFER', // Default payment method
          commissionFee: this.calculateCommission(transaction.monthlyRent, TransactionStyle.RENT),
          notes: `Payment for rental transaction ${transaction.id}`,
          transactionStyle: TransactionStyle.RENT,
          agentId: agentId
        };
        
        return this.paymentService.processPayment(paymentRequest).pipe(
          map(() => transaction) 
        );
      }),
      catchError(error => {
        console.error('Error creating rental transaction with payment:', error);
        throw error;
      })
    );
  }

  // Get a rental transaction by ID
  getRentalTransactionById(transactionId: string): Observable<RentalTransactionResponse> {
    return this.http.get<any>(`${this.rentalApiUrl}/${transactionId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting rental transaction:', error);
        throw error;
      })
    );
  }

  // Get all rental transactions with pagination
  getAllRentalTransactions(request: PageRentalTransactionRequest): Observable<PageDto<RentalTransactionResponse>> {
    return this.http.get<any>(`${this.rentalApiUrl}/find/${request.page}/${request.size}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting all rental transactions:', error);
        throw error;
      })
    );
  }

  getRentalTransactionsByRenter(renterId: string): Observable<RentalTransactionResponse[]> {
    return this.http.get<any>(`${this.rentalApiUrl}/renter/${renterId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting renter rental transactions:', error);
        throw error;
      })
    );
  }

  // Get rental transactions by agent
  getRentalTransactionsByAgent(agentId: string): Observable<RentalTransactionResponse[]> {
    return this.http.get<any>(`${this.rentalApiUrl}/agent/${agentId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting agent rental transactions:', error);
        throw error;
      })
    );
  }

  // Get rental transactions by listing
  getRentalTransactionsByListing(listingId: string): Observable<RentalTransactionResponse[]> {
    return this.http.get<any>(`${this.rentalApiUrl}/listing/${listingId}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error getting listing rental transactions:', error);
        throw error;
      })
    );
  }

  // Update rental transaction status
  updateRentalTransactionStatus(transactionId: string, status: string): Observable<RentalTransactionResponse> {
    const statusRequest: StatusUpdateRequest = { status };
    return this.http.put<any>(`${this.rentalApiUrl}/updateStatus/${transactionId}`, statusRequest).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating rental transaction status:', error);
        throw error;
      })
    );
  }

  // COMPATIBILITY METHODS (Using API instead of mock data)

  // Get all transactions (using combined API calls)
  getTransactions(): Observable<Transaction[]> {
    const pageRequest: PageSalesTransactionRequest = {
      page: 1,
      size: 50
    };

    return this.getAllSalesTransactions(pageRequest).pipe(
      map(salesPage => {
        const salesTransactions = salesPage.items.map(sale => this.mapSalesToTransaction(sale))
        return salesTransactions;
      }),
      catchError(error => {
        console.error('Error getting combined transactions:', error);
        return of([]);
      })
    );
  }

  // Get a transaction by ID
  getTransactionById(id: string): Observable<Transaction | undefined> {
    return this.getSalesTransactionById(id).pipe(
      map(sale => this.mapSalesToTransaction(sale)),
      catchError(error => {
        return this.getRentalTransactionById(id).pipe(
          map(rental => this.mapRentalToTransaction(rental)),
          catchError(error => {
            console.error('Transaction not found in either sales or rentals:', error);
            return of(undefined);
          })
        );
      })
    );
  }
  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    const currentUser = this.authService.getCurrentUser();
    const agentId = currentUser?.id || '';
    if (transaction.type === 'sale') {
      const saleRequest: SalesTransactionRequest = {
        listingId: transaction.property.id.toString(),
        buyerId: 'buyer-placeholder', 
        agentId: agentId, 
        amount: transaction.amount,
        transactionStatus: transaction.status
      };

      return this.createSalesTransaction(saleRequest).pipe(
        map(response => this.mapSalesToTransaction(response))
      );
    } else {
      // Rental transaction
      const rentalRequest: RentalTransactionRequest = {
        listingId: transaction.property.id.toString(),
        renterId: 'renter-placeholder', 
        agentId: agentId, 
        status: transaction.status,
        monthlyRent: transaction.amount,
        deposit: transaction.amount * 2, // Example: 2 months deposit
        startDate: new Date().toISOString().split('T')[0], // Today
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year from now
      };

      return this.createRentalTransaction(rentalRequest).pipe(
        map(response => this.mapRentalToTransaction(response))
      );
    }
  }

  // Update an existing transaction
  updateTransaction(transaction: Transaction): Observable<Transaction> {
    // Determine if it's a sale or rental transaction
    if (transaction.type === 'sale') {
      return this.updateSalesTransactionStatus(transaction.id!.toString(), transaction.status).pipe(
        map(response => this.mapSalesToTransaction(response))
      );
    } else {
      // Rental transaction
      return this.updateRentalTransactionStatus(transaction.id!.toString(), transaction.status).pipe(
        map(response => this.mapRentalToTransaction(response))
      );
    }
  }

  // Delete a transaction - Not supported by API, returning mock response
  deleteTransaction(id: string): Observable<boolean> {
    console.warn('Delete transaction is not supported by the API');
    return of(false);
  }

  // Get buy transactions with new status
  getBuyTransactions(): Observable<Transaction[]> {
    const pageRequest: PageSalesTransactionRequest = {
      page: 1,
      size: 50
    };

    return this.getAllSalesTransactions(pageRequest).pipe(
      map(salesPage => {
        // Transform sales transactions to the legacy format
        return salesPage.items.map(sale => this.mapSalesToTransaction(sale));
      }),
      catchError(error => {
        console.error('Error getting buy transactions:', error);
        return of([]);
      })
    );
  }

  // Get rent transactions with new status
  getRentTransactions(): Observable<Transaction[]> {
    const pageRequest: PageRentalTransactionRequest = {
      page: 1,
      size: 50
    };

    return this.getAllRentalTransactions(pageRequest).pipe(
      map(rentalPage => {
        // Transform rental transactions to the legacy format
        return rentalPage.items.map(rental => this.mapRentalToTransaction(rental));
      }),
      catchError(error => {
        console.error('Error getting rent transactions:', error);
        return of([]);
      })
    );
  }

  // Complete a transaction
  completeTransaction(id: string, isRental: boolean = false): Observable<any> {
    if (isRental) {
      return this.updateRentalTransactionStatus(id, RentalStatus.COMPLETED);
    } else {
      return this.updateSalesTransactionStatus(id, TransactionStatus.COMPLETED);
    }
  }

  // Cancel a transaction
  cancelTransaction(id: string, isRental: boolean = false): Observable<any> {
    if (isRental) {
      return this.updateRentalTransactionStatus(id, RentalStatus.CANCELLED);
    } else {
      return this.updateSalesTransactionStatus(id, TransactionStatus.CANCELLED);
    }
  }

  // Get completed transactions in current month using API
  getCompletedTransactionsInCurrentMonth(): Observable<Transaction[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Create request for completed sales transactions in current month
    const salesRequest: PageSalesTransactionRequest = {
      page: 1,
      size: 50
    };

    return this.getAllSalesTransactions(salesRequest).pipe(
      map(salesPage => {
        // Filter for current month and transform to legacy format
        return salesPage.items
          .filter(sale => {
            const completedDate = sale.completedAt ? new Date(sale.completedAt) : null;
            return completedDate && 
                   completedDate >= startOfMonth && 
                   completedDate <= endOfMonth &&
                   sale.transactionStatus === TransactionStatus.COMPLETED;
          })
          .map(sale => this.mapSalesToTransaction(sale));
      }),
      catchError(error => {
        console.error('Error getting completed transactions:', error);
        return of([]);
      })
    );
  }
  
  // Get completed transactions count in current month
  getCompletedTransactionsCountInCurrentMonth(): Observable<number> {
    return this.getCompletedTransactionsInCurrentMonth().pipe(
      map(transactions => transactions.length)
    );
  }
  
  // Calculate commission based on transaction amount and type
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

  // Helper method to map sales transaction to legacy format
  private mapSalesToTransaction(sale: SalesTransactionResponse): Transaction {
    return {
      id: sale.id,
      type: 'sale',
      amount: sale.amount,
      status: sale.transactionStatus,
      paymentStatus: 'pending', // Default until we check payment status
      date: new Date(sale.createdAt).toISOString(),
      property: {
        id: sale.listingId,
        title: 'Property', // Will be fetched from listings
        image: '', // Will be fetched from listings
        mainURL: '' // Will be fetched from listings
      },
      client: {
        name: 'Client', // We would need to fetch this from users
        email: '' // We would need to fetch this from users
      },
      // Additional properties
      propertyId: sale.listingId,
      transactionType: 'sale',
      buyerId: sale.buyerId,
      agentId: sale.agentId,
      completionDate: sale.completedAt ? new Date(sale.completedAt) : undefined
    };
  }

  // Helper method to map rental transaction to legacy format
  private mapRentalToTransaction(rental: RentalTransactionResponse): Transaction {
    return {
      id: rental.id,
      type: 'rent',
      amount: rental.monthlyRent,
      status: rental.status,
      paymentStatus: 'pending', // Default until we check payment status
      date: new Date(rental.createdAt).toISOString(),
      property: {
        id: rental.listingId,
        title: 'Property', // Will be fetched from listings
        image: '', // Will be fetched from listings
        mainURL: '' // Will be fetched from listings
      },
      client: {
        name: 'Client', // We would need to fetch this from users
        email: '' // We would need to fetch this from users
      },
      // Additional properties
      propertyId: rental.listingId,
      transactionType: 'rent',
      buyerId: rental.renterId,
      agentId: rental.agentId,
      startDate: rental.startDate,
      endDate: rental.endDate
    };
  }

  // Find transaction by ID and determine its type (SALE or RENT)
  findTransactionTypeById(transactionId: string): Observable<string> {
    // First try to find it as a sales transaction
    return this.getSalesTransactionById(transactionId).pipe(
      map(sale => 'SALE'),
      catchError(saleError => {
        // If not found as a sale, try as a rental
        return this.getRentalTransactionById(transactionId).pipe(
          map(rental => 'RENT'),
          catchError(rentError => {
            console.error('Transaction not found in either sales or rentals:', transactionId);
            return of('UNKNOWN');
          })
        );
      })
    );
  }
} 