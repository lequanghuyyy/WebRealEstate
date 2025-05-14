import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, map, tap } from 'rxjs';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Payment, PaymentMethod, PaymentStatus, TransactionStyle } from '../models/payment.model';
import { Property } from '../models/property.model';
// import { Review } from '../models/review.model';
import { Contact } from '../models/contact.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BaseResponse as ApiBaseResponse, UserStatus as AuthUserStatus, UserUpdateRequest as AuthUserUpdateRequest } from '../models/auth.model';

interface BaseResponse<T> {
  status: string;
  description: string;
  data: T;
}

// Add ListingType enum to match backend
export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT'
}

// Add UserStatus enum to match backend
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED'
}

// Add Role enum for the user roles
export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  BUYER = 'BUYER',
  RENTER = 'RENTER',
  USER = 'USER'
}

// User update interface
export interface UserUpdateRequest {
  userId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  status?: UserStatus;
  role?: Role;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/`;

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

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Dashboard data
  getDashboardStats(): Observable<{
    users: { 
      total: number; 
      active: number; 
      agents: number;
      buyers: number;
      renters: number;
    };
    transactions: { total: number; sales: number; rentals: number; pending: number; completed: number };
    revenue: { total: number; commissions: number; thisMonth: number };
    properties: { total: number; forSale: number; forRent: number; pending: number };
    _endpointStatus?: {
      users: boolean;
      agents: boolean;
      buyers: boolean;
      renters: boolean;
      sales: boolean;
      rentals: boolean;
      pending: boolean;
      completed: boolean;
      commission: boolean;
      properties: boolean;
      propertiesSale: boolean;
      propertiesRent: boolean;
      propertiesPending: boolean;
      totalRevenue: boolean;
      monthlyRevenue: boolean;
    };
  }> {
    // Kiểm tra cấu hình API URL
    console.log('Environment API URL:', environment.apiUrl);
    console.log('Full userCount endpoint:', `${environment.apiUrl}/users/count`);
    
    // Connect to the real backend API endpoints defined in the controllers
    const usersCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/users/count`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        tap(response => console.log('Phản hồi số lượng người dùng:', response)),
        map(response => response.data),
        catchError(error => {
          console.error('Lỗi khi lấy số lượng người dùng:', error);
          if (error.status === 401) {
            console.error('Lỗi xác thực 401: Token không hợp lệ hoặc đã hết hạn');
          }
          return of(this.mockUsers.length);
        })
      );
    // Add counts for specific user roles
    const agentCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/users/count/AGENT`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching agent count:', error);
          return of(this.mockUsers.filter(u => u.role === 'agent').length);
        })
      );
      
    const buyerCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/users/count/BUYER`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching buyer count:', error);
          return of(Math.floor(this.mockUsers.length * 0.6)); // Mock estimation
        })
      );
      
    const renterCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/users/count/RENTER`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching renter count:', error);
          return of(Math.floor(this.mockUsers.length * 0.3)); // Mock estimation
        })
      );
    
    const salesCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/sales/count`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching sales count:', error);
          return of(this.mockTransactions.filter(t => t.transactionType === 'sale' || t.type === 'sale').length);
        })
      );

    const rentalsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/rentals/count`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching rentals count:', error);
          return of(this.mockTransactions.filter(t => t.transactionType === 'rent' || t.type === 'rent').length);
        })
      );

    // Get count of pending transactions
    const pendingTransactionsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/transactions/count/pending`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching pending transactions count:', error);
          return of(this.mockTransactions.filter(t => t.status === 'pending' || t.status === 'PENDING').length);
        })
      );

    // Get count of completed transactions
    const completedTransactionsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/transactions/count/completed`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching completed transactions count:', error);
          return of(this.mockTransactions.filter(t => t.status === 'completed' || t.status === 'COMPLETED').length);
        })
      );

    const commission$ = this.http.get<BaseResponse<string>>(`${environment.apiUrl}/payments/commission`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => parseFloat(response.data) || 0),
        catchError(error => {
          console.error('Error fetching commission:', error);
          return of(this.mockTransactions.reduce((sum, t) => sum + (t.commissionFee || 0), 0));
        })
      );

    const totalListingsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/listings/count`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching total listings count:', error);
          return of(0);
        })
      );

    const saleListingsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/listings/countByType/${ListingType.SALE}`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching sale listings count:', error);
          return of(0);
        })
      );

    const rentListingsCount$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/listings/countByType/${ListingType.RENT}`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching rent listings count:', error);
          return of(0);
        })
      );

    // Get total revenue - this might need to be adjusted based on your backend API
    const totalRevenue$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/payments/total`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching total revenue:', error);
          return of(this.mockTransactions.reduce((sum, t) => sum + t.amount, 0));
        })
      );

    // Get monthly revenue - this might need to be adjusted based on your backend API
    const monthlyRevenue$ = this.http.get<BaseResponse<number>>(`${environment.apiUrl}/payments/monthly`, {
      headers: this.createAuthHeaders()
    })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching monthly revenue:', error);
          // Fallback to mock calculation
          const thisMonth = this.mockTransactions
            .filter(t => {
              const transactionDate = new Date(t.date);
              const now = new Date();
              return transactionDate.getMonth() === now.getMonth() && 
                    transactionDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
          return of(thisMonth);
        })
      );

    // Combine all observables to return a single object with all stats
    return forkJoin({
      usersCount: usersCount$,
      agentCount: agentCount$,
      buyerCount: buyerCount$,
      renterCount: renterCount$,
      salesCount: salesCount$,
      rentalsCount: rentalsCount$,
      pendingTransactionsCount: pendingTransactionsCount$,
      completedTransactionsCount: completedTransactionsCount$,
      commission: commission$,
      totalListingsCount: totalListingsCount$,
      saleListingsCount: saleListingsCount$,
      rentListingsCount: rentListingsCount$,
      totalRevenue: totalRevenue$,
      monthlyRevenue: monthlyRevenue$
    }).pipe(
      map(results => {
        // Track endpoint status
        const endpointStatus = {
          users: typeof results.usersCount === 'number' && results.usersCount > 0,
          agents: typeof results.agentCount === 'number' && results.agentCount >= 0,
          buyers: typeof results.buyerCount === 'number' && results.buyerCount >= 0,
          renters: typeof results.renterCount === 'number' && results.renterCount >= 0,
          sales: typeof results.salesCount === 'number' && results.salesCount >= 0,
          rentals: typeof results.rentalsCount === 'number' && results.rentalsCount >= 0,
          pending: typeof results.pendingTransactionsCount === 'number' && results.pendingTransactionsCount >= 0,
          completed: typeof results.completedTransactionsCount === 'number' && results.completedTransactionsCount >= 0,
          commission: typeof results.commission === 'number' && results.commission >= 0,
          properties: typeof results.totalListingsCount === 'number' && results.totalListingsCount >= 0,
          propertiesSale: typeof results.saleListingsCount === 'number' && results.saleListingsCount >= 0,
          propertiesRent: typeof results.rentListingsCount === 'number' && results.rentListingsCount >= 0,
          totalRevenue: typeof results.totalRevenue === 'number' && results.totalRevenue >= 0,
          monthlyRevenue: typeof results.monthlyRevenue === 'number' && results.monthlyRevenue >= 0
        };
        
        // Format the response to match the expected dashboard stats structure
        return {
          users: {
            total: results.usersCount,
            active: results.usersCount,
            agents: results.agentCount,
            buyers: results.buyerCount,
            renters: results.renterCount
          },
          transactions: {
            total: results.salesCount + results.rentalsCount,
            sales: results.salesCount,
            rentals: results.rentalsCount,
            pending: results.pendingTransactionsCount,
            completed: results.completedTransactionsCount
          },
          revenue: {
            total: results.totalRevenue || results.commission, // Using available revenue data
            commissions: results.commission,
            thisMonth: results.monthlyRevenue
          },
          properties: {
            total: results.totalListingsCount,
            forSale: results.saleListingsCount,
            forRent: results.rentListingsCount,
          },
          // Include endpoint status in the response
          _endpointStatus: endpointStatus
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
    return this.http.get<BaseResponse<User[]>>(`${environment.apiUrl}/users`, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of(this.mockUsers);
      })
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<BaseResponse<User>>(`${environment.apiUrl}/users/${userId}`, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error fetching user with ID ${userId}:`, error);
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        return of(user);
      })
    );
  }

  updateUserStatus(userId: string, status: UserStatus): Observable<User> {
    const updateRequest: UserUpdateRequest = {
      userId: userId,
      status: status
    };
    
    return this.http.put<BaseResponse<User>>(`${environment.apiUrl}/users/update/${userId}`, updateRequest, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error updating user status for user ID ${userId}:`, error);
        // Fallback to mock data
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        // Update the mock user status with string compatible with the original mock data structure
        user.status = status === UserStatus.ACTIVE ? 'active' : 'pending';
        return of({ ...user });
      })
    );
  }

  updateUserRole(userId: string, role: Role): Observable<User> {
    const updateRequest: UserUpdateRequest = {
      userId: userId,
      role: role
    };
    
    return this.http.put<BaseResponse<User>>(`${environment.apiUrl}/users/update/${userId}`, updateRequest, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error updating user role for user ID ${userId}:`, error);
        // Fallback to mock data
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        // Convert enum to a string compatible with the original mock data structure
        const roleMapping: Record<Role, 'admin' | 'agent' | 'user'> = {
          [Role.ADMIN]: 'admin',
          [Role.AGENT]: 'agent',
          [Role.BUYER]: 'user',
          [Role.RENTER]: 'user',
          [Role.USER]: 'user'
        };
        user.role = roleMapping[role];
        return of({ ...user });
      })
    );
  }

  deleteUser(userId: string): Observable<string> {
    return this.http.delete<BaseResponse<string>>(`${environment.apiUrl}/users/delete/${userId}`, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error deleting user with ID ${userId}:`, error);
        return of('User deletion failed');
      })
    );
  }

  getPendingAgents(): Observable<User[]> {
    return this.http.get<BaseResponse<User[]>>(`${environment.apiUrl}/users/pending-agents`, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching pending agents:', error);
        // Fallback to mock data - filter users with agent role and pending status
        return of(this.mockUsers.filter(u => u.role === 'agent' && u.status === 'pending'));
      })
    );
  }

  approveAgent(userId: string): Observable<User> {
    return this.http.put<BaseResponse<User>>(`${environment.apiUrl}/users/${userId}/approve`, {}, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error approving agent with ID ${userId}:`, error);
        // Fallback to mock data
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        user.status = 'active';
        return of({ ...user });
      })
    );
  }

  rejectAgent(userId: string): Observable<User> {
    return this.http.put<BaseResponse<User>>(`${environment.apiUrl}/users/${userId}/reject`, {}, {
      headers: this.createAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error rejecting agent with ID ${userId}:`, error);
        // Fallback to mock data
        const user = this.mockUsers.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }
        user.status = 'pending'; // Use a valid status from the original model
        return of({ ...user });
      })
    );
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

  // Helper method to create auth headers
  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Không tìm thấy token xác thực từ authService');
      return new HttpHeaders();
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get commission fee for a specific transaction style
  getCommissionByTransactionStyle(style: TransactionStyle): Observable<number> {
    const headers = this.createAuthHeaders();
    return this.http.get<BaseResponse<string>>(
      `${this.apiUrl}/payments/commission/${style}`, 
      { headers, observe: 'body' }
    ).pipe(
      map(response => {
        // Parse the string value to a number
        return parseFloat(response.data);
      }),
      catchError(error => {
        console.error(`Error fetching ${style} commission:`, error);
        // Return a default value based on transaction style
        return of(style === TransactionStyle.SALE ? 7500 : 600);
      })
    );
  }
} 