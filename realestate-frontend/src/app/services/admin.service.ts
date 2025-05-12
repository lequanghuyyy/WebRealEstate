import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, map } from 'rxjs';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Payment, PaymentMethod, PaymentStatus, TransactionStyle } from '../models/payment.model';
import { Property } from '../models/property.model';
// import { Review } from '../models/review.model';
import { Contact } from '../models/contact.model';
import { environment } from '../../environments/environment';

interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  // Mock data for demo purposes
  private mockTransactions: Transaction[] = [
    {
      id: 't1',
      type: 'sale',
      transactionType: 'sale',
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      propertyType: 'apartment',
      amount: 250000,
      commissionFee: 7500,
      status: 'completed',
      paymentStatus: 'paid',
      date: '2023-05-10',
      buyerId: '1',
      buyerName: 'John Doe',
      sellerId: '2',
      sellerName: 'Jane Smith',
      agentId: '3',
      agentName: 'Agent Smith',
      paymentMethod: 'bank_transfer',
      notes: 'Smooth transaction, all documents verified',
      property: {
        id: 'p1',
        title: 'Luxury Apartment in District 1',
        image: 'assets/images/properties/apartment1.jpg'
      },
      client: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: 't2',
      type: 'rent',
      transactionType: 'rent',
      propertyId: 'p2',
      propertyTitle: 'Modern House in District 2',
      propertyType: 'house',
      amount: 1200,
      commissionFee: 600,
      status: 'pending',
      paymentStatus: 'pending',
      date: '2023-05-20',
      buyerId: '3',
      buyerName: 'Bob Johnson',
      sellerId: '5',
      sellerName: 'Tom Wilson',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      paymentMethod: 'credit_card',
      notes: 'Lease agreement pending signatures',
      property: {
        id: 'p2',
        title: 'Modern House in District 2',
        image: 'assets/images/properties/house1.jpg'
      },
      client: {
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    }
  ];
  
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      phone: '123-456-7890',
      createdAt: new Date('2023-01-15')
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      phone: '234-567-8901',
      createdAt: new Date('2023-02-20')
    },
    {
      id: '3',
      name: 'Agent Smith',
      email: 'agent@example.com',
      role: 'agent',
      status: 'active',
      phone: '345-678-9012',
      bio: 'Professional real estate agent with 5 years of experience',
      createdAt: new Date('2023-03-05')
    }
  ];

  private mockPayments: Payment[] = [
    {
      id: 'pay1',
      transactionId: 't1',
      amount: 250000,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDate: '2023-05-10',
      commissionFee: 7500,
      notes: 'Full payment for property purchase',
      createdAt: '2023-05-10',
      transactionStyle: TransactionStyle.SALE,
      // Legacy fields for backward compatibility
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      paymentType: 'full',
      status: 'completed',
      payerId: '1',
      payerName: 'John Doe',
      recipientId: '2',
      recipientName: 'Jane Smith',
      date: '2023-05-10',
      method: 'bank_transfer',
      reference: 'REF123456789'
    },
    {
      id: 'pay2',
      transactionId: 't1',
      amount: 7500,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentDate: '2023-05-12',
      commissionFee: 0,
      notes: 'Commission payment for property sale',
      createdAt: '2023-05-12',
      transactionStyle: TransactionStyle.SALE,
      // Legacy fields for backward compatibility
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      paymentType: 'commission',
      status: 'completed',
      payerId: '2',
      payerName: 'Jane Smith',
      recipientId: '0',
      recipientName: 'Real Estate Company',
      date: '2023-05-12',
      method: 'bank_transfer',
      reference: 'COM123456789'
    },
    {
      id: 'pay3',
      transactionId: 't2',
      amount: 1200,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: PaymentStatus.PENDING,
      paymentDate: '2023-05-20',
      commissionFee: 600,
      notes: 'Rental payment',
      createdAt: '2023-05-20',
      transactionStyle: TransactionStyle.RENT,
      // Legacy fields for backward compatibility
      propertyId: 'p2',
      propertyTitle: 'Modern House in District 2',
      paymentType: 'full',
      status: 'pending',
      payerId: '3',
      payerName: 'Bob Johnson',
      recipientId: '5',
      recipientName: 'Tom Wilson',
      date: '2023-05-20',
      method: 'credit_card'
    }
  ];

  private mockContacts: Contact[] = [
    {
      id: 'c1',
      name: 'Michael Clark',
      email: 'michael@example.com',
      phone: '444-555-6666',
      subject: 'Property Inquiry',
      message: 'I am interested in the property on 123 Main St. Please provide more details.',
      status: 'new',
      category: 'inquiry',
      createdAt: new Date('2023-05-15')
    },
    {
      id: 'c2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '777-888-9999',
      subject: 'Website Issue',
      message: 'I cannot access my saved properties on my account. Please help.',
      status: 'pending',
      category: 'support',
      assignedTo: 'admin',
      createdAt: new Date('2023-05-14')
    },
    {
      id: 'c3',
      name: 'David Brown',
      email: 'david@example.com',
      subject: 'Feedback on Agent Service',
      message: 'I had a great experience working with agent Jane Smith. She was very professional.',
      status: 'resolved',
      category: 'feedback',
      assignedTo: 'admin',
      createdAt: new Date('2023-05-10'),
      resolvedAt: new Date('2023-05-12'),
      notes: 'Thanked user for positive feedback'
    }
  ];

  constructor(private http: HttpClient) { }

  // Dashboard data
  getDashboardStats(): Observable<any> {
    // Connect to the real backend API endpoints
    // Create observables for each API call
    const usersCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/api/v1/users/count`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching users count:', error);
          return of(this.mockUsers.length);
        })
      );

    const salesCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/api/v1/sales/count`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching sales count:', error);
          return of(this.mockTransactions.filter(t => t.transactionType === 'sale' || t.type === 'sale').length);
        })
      );

    const rentalsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/api/v1/rentals/count`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching rentals count:', error);
          return of(this.mockTransactions.filter(t => t.transactionType === 'rent' || t.type === 'rent').length);
        })
      );

    const commission$ = this.http.get<BaseResponse<string>>(`${environment.apiUrl}/api/v1/payments/commission`)
      .pipe(
        map(response => parseFloat(response.data) || 0),
        catchError(error => {
          console.error('Error fetching commission:', error);
          return of(this.mockTransactions.reduce((sum, t) => sum + (t.commissionFee || 0), 0));
        })
      );

    const listingsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/api/v1/listings/count`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching listings count:', error);
          return of(0); // Fallback to 0 since we don't have mock data for properties
        })
      );

    // Combine all observables to return a single object with all stats
    return forkJoin({
      usersCount: usersCount$,
      salesCount: salesCount$,
      rentalsCount: rentalsCount$,
      commission: commission$,
      listingsCount: listingsCount$
    }).pipe(
      map(results => {
        // Calculate current month revenue (using mock data as fallback)
        const thisMonth = this.mockTransactions
          .filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && 
                  transactionDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0);

        // Format the response to match the expected dashboard stats structure
        return {
          users: {
            total: results.usersCount,
            active: results.usersCount, // Assuming all users are active
            agents: this.mockUsers.filter(u => u.role === 'agent').length // Using mock data as fallback
          },
          transactions: {
            total: results.salesCount + results.rentalsCount,
            sales: results.salesCount,
            rentals: results.rentalsCount,
            pending: this.mockTransactions.filter(t => t.status === 'pending' || t.status === 'PENDING').length,
            completed: this.mockTransactions.filter(t => t.status === 'completed' || t.status === 'COMPLETED').length
          },
          revenue: {
            total: results.commission, // Using commission as total revenue for now
            commissions: results.commission,
            thisMonth: thisMonth
          },
          properties: {
            total: results.listingsCount,
            forSale: Math.floor(results.listingsCount * 0.7), // Estimating 70% for sale
            forRent: Math.floor(results.listingsCount * 0.3), // Estimating 30% for rent
            pending: Math.floor(results.listingsCount * 0.1) // Estimating 10% pending
          }
        };
      }),
      catchError(error => {
        console.error('Error combining dashboard stats:', error);
        // Fallback to mock data in case of error
        return this.getFallbackStats();
      })
    );
  }

  // New method to get fallback stats
  private getFallbackStats(): Observable<any> {
    const stats = {
      users: {
        total: this.mockUsers.length,
        active: this.mockUsers.filter(u => u.status === 'active').length,
        agents: this.mockUsers.filter(u => u.role === 'agent').length
      },
      transactions: {
        total: this.mockTransactions.length,
        sales: this.mockTransactions.filter(t => t.transactionType === 'sale' || t.type === 'sale').length,
        rentals: this.mockTransactions.filter(t => t.transactionType === 'rent' || t.type === 'rent').length,
        pending: this.mockTransactions.filter(t => t.status === 'pending' || t.status === 'PENDING').length,
        completed: this.mockTransactions.filter(t => t.status === 'completed' || t.status === 'COMPLETED').length
      },
      revenue: {
        total: this.mockTransactions.reduce((sum, t) => sum + t.amount, 0),
        commissions: this.mockTransactions.reduce((sum, t) => sum + (t.commissionFee || 0), 0),
        thisMonth: this.mockTransactions
          .filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && 
                  transactionDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0)
      },
      properties: {
        total: 120, // Mock data
        forSale: 80,
        forRent: 40,
        pending: 15
      }
    };
    
    return of(stats);
  }

  // Transaction management
  getTransactions(): Observable<Transaction[]> {
    // In a real app: return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
    return of(this.mockTransactions);
  }

  updateTransactionStatus(id: string | number, status: string): Observable<Transaction> {
    // In a real app: return this.http.patch<Transaction>(`${this.apiUrl}/transactions/${id}/status`, { status });
    const transaction = this.mockTransactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    transaction.status = status;
    if (status === 'completed') {
      transaction.paymentStatus = 'paid';
      transaction.completionDate = new Date();
    } else if (status === 'cancelled') {
      transaction.paymentStatus = 'cancelled';
    }
    return of({ ...transaction });
  }

  // User management
  getUsers(): Observable<User[]> {
    // In a real app: return this.http.get<User[]>(`${this.apiUrl}/users`);
    return of(this.mockUsers);
  }

  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Observable<User> {
    // In a real app: return this.http.patch<User>(`${this.apiUrl}/users/${userId}/status`, { status });
    const user = this.mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.status = status;
    return of({ ...user });
  }

  updateUserRole(userId: string, role: 'user' | 'agent' | 'admin'): Observable<User> {
    // In a real app: return this.http.patch<User>(`${this.apiUrl}/users/${userId}/role`, { role });
    const user = this.mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return of({ ...user });
  }

  // Property management
  getListings(): Observable<Property[]> {
    // In a real app: return this.http.get<Property[]>(`${this.apiUrl}/listings`);
    return of([]);  // Mock data would come from the PropertyService
  }

  approveProperty(id: string): Observable<any> {
    // In a real app: return this.http.patch<any>(`${this.apiUrl}/listings/${id}/approve`, {});
    return of({ success: true, message: 'Property approved' });
  }

  rejectProperty(id: string, reason: string): Observable<any> {
    // In a real app: return this.http.patch<any>(`${this.apiUrl}/listings/${id}/reject`, { reason });
    return of({ success: true, message: 'Property rejected' });
  }

  // Payment management
  getPayments(): Observable<Payment[]> {
    // In a real app: return this.http.get<Payment[]>(`${this.apiUrl}/payments`);
    return of(this.mockPayments);
  }

  getPaymentById(id: string): Observable<Payment> {
    // In a real app: return this.http.get<Payment>(`${this.apiUrl}/payments/${id}`);
    const payment = this.mockPayments.find(p => p.id === id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return of(payment);
  }

  // Review management
  // getReviews(): Observable<Review[]> {
  //   // In a real app: return this.http.get<Review[]>(`${this.apiUrl}/reviews`);
  //   return of([]);  // Mock data would come from the ReviewService
  // }

  moderateReview(id: string, action: 'approve' | 'reject'): Observable<any> {
    // In a real app: return this.http.patch<any>(`${this.apiUrl}/reviews/${id}/${action}`, {});
    return of({ success: true, message: `Review ${action}d` });
  }

  // Contact management
  getContacts(): Observable<Contact[]> {
    // In a real app: return this.http.get<Contact[]>(`${this.apiUrl}/contacts`);
    return of(this.mockContacts);
  }

  getContactById(id: string): Observable<Contact> {
    // In a real app: return this.http.get<Contact>(`${this.apiUrl}/contacts/${id}`);
    const contact = this.mockContacts.find(c => c.id === id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return of(contact);
  }

  updateContactStatus(id: string, status: 'new' | 'pending' | 'resolved' | 'spam', notes?: string): Observable<Contact> {
    // In a real app: return this.http.patch<Contact>(`${this.apiUrl}/contacts/${id}`, { status, notes });
    const contact = this.mockContacts.find(c => c.id === id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    contact.status = status;
    if (notes) {
      contact.notes = notes;
    }
    if (status === 'resolved' && !contact.resolvedAt) {
      contact.resolvedAt = new Date();
    }
    return of(contact);
  }
} 