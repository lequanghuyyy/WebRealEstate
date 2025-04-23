import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Transaction } from '../models/transaction.model';
import { Payment } from '../models/payment.model';
import { Property } from '../models/property.model';
import { Review } from '../models/review.model';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin'; // Replace with your actual API

  // Mock data for demo purposes
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'user1@example.com',
      name: 'John Doe',
      role: 'user',
      phone: '123-456-7890',
      status: 'active',
      createdAt: '2023-01-15',
      lastLogin: '2023-05-20',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        newsletter: true
      }
    },
    {
      id: '2',
      email: 'agent1@example.com',
      name: 'Jane Smith',
      role: 'agent',
      phone: '098-765-4321',
      status: 'active',
      createdAt: '2022-08-10',
      lastLogin: '2023-05-22',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      agentInfo: {
        licenseNumber: 'AG12345678',
        agency: 'RealEstatePro Agency',
        averageRating: 4.8,
        listings: 24,
        sales: 45
      }
    },
    {
      id: '3',
      email: 'user2@example.com',
      name: 'Bob Johnson',
      role: 'user',
      status: 'inactive',
      createdAt: '2023-02-20',
      lastLogin: '2023-03-10'
    },
    {
      id: '4',
      email: 'user3@example.com',
      name: 'Alice Brown',
      role: 'user',
      phone: '555-123-4567',
      status: 'active',
      createdAt: '2023-03-05',
      lastLogin: '2023-05-23',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '5',
      email: 'agent2@example.com',
      name: 'Tom Wilson',
      role: 'agent',
      phone: '777-888-9999',
      status: 'active',
      createdAt: '2022-10-15',
      lastLogin: '2023-05-21',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      agentInfo: {
        licenseNumber: 'AG87654321',
        agency: 'Prime Properties',
        averageRating: 4.5,
        listings: 18,
        sales: 32
      }
    }
  ];

  private mockTransactions: Transaction[] = [
    {
      id: 't1',
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      propertyType: 'apartment',
      transactionType: 'sale',
      amount: 250000,
      status: 'completed',
      buyerId: '1',
      buyerName: 'John Doe',
      sellerId: '2',
      sellerName: 'Jane Smith',
      agentId: '2',
      agentName: 'Jane Smith',
      commission: 7500,
      date: new Date('2023-04-15'),
      completionDate: new Date('2023-05-10'),
      paymentMethod: 'bank_transfer',
      notes: 'Transaction completed successfully'
    },
    {
      id: 't2',
      propertyId: 'p2',
      propertyTitle: 'Modern House in District 2',
      propertyType: 'house',
      transactionType: 'rent',
      amount: 1200,
      status: 'pending',
      buyerId: '3',
      buyerName: 'Bob Johnson',
      sellerId: '5',
      sellerName: 'Tom Wilson',
      agentId: '5',
      agentName: 'Tom Wilson',
      commission: 600,
      date: new Date('2023-05-20'),
      paymentMethod: 'credit_card'
    },
    {
      id: 't3',
      propertyId: 'p3',
      propertyTitle: 'Commercial Space Downtown',
      propertyType: 'commercial',
      transactionType: 'sale',
      amount: 450000,
      status: 'completed',
      buyerId: '4',
      buyerName: 'Alice Brown',
      sellerId: '2',
      sellerName: 'Jane Smith',
      agentId: '2',
      agentName: 'Jane Smith',
      commission: 13500,
      date: new Date('2023-03-10'),
      completionDate: new Date('2023-04-05'),
      paymentMethod: 'bank_transfer'
    }
  ];

  private mockPayments: Payment[] = [
    {
      id: 'pay1',
      transactionId: 't1',
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      amount: 250000,
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
      propertyId: 'p1',
      propertyTitle: 'Luxury Apartment in District 1',
      amount: 7500,
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
      propertyId: 'p2',
      propertyTitle: 'Modern House in District 2',
      amount: 1200,
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
    // In a real app, this would be an API call
    const stats = {
      users: {
        total: this.mockUsers.length,
        active: this.mockUsers.filter(u => u.status === 'active').length,
        agents: this.mockUsers.filter(u => u.role === 'agent').length
      },
      transactions: {
        total: this.mockTransactions.length,
        sales: this.mockTransactions.filter(t => t.transactionType === 'sale').length,
        rentals: this.mockTransactions.filter(t => t.transactionType === 'rent').length,
        pending: this.mockTransactions.filter(t => t.status === 'pending').length,
        completed: this.mockTransactions.filter(t => t.status === 'completed').length
      },
      revenue: {
        total: this.mockTransactions.reduce((sum, t) => sum + t.amount, 0),
        commissions: this.mockTransactions.reduce((sum, t) => sum + (t.commission || 0), 0),
        thisMonth: this.mockTransactions
          .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
          .reduce((sum, t) => sum + t.amount, 0)
      },
      properties: {
        total: 45,
        forSale: 30,
        forRent: 15,
        pending: 5
      }
    };
    
    return of(stats);
  }

  // User management
  getUsers(): Observable<User[]> {
    // In a real app: return this.http.get<User[]>(`${this.apiUrl}/users`);
    return of(this.mockUsers);
  }

  getUserById(id: string): Observable<User> {
    // In a real app: return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    const user = this.mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return of(user);
  }

  updateUserStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Observable<User> {
    // In a real app: return this.http.patch<User>(`${this.apiUrl}/users/${id}`, { status });
    const user = this.mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    user.status = status;
    return of(user);
  }

  updateUserRole(id: string, role: 'admin' | 'agent' | 'user'): Observable<User> {
    // In a real app: return this.http.patch<User>(`${this.apiUrl}/users/${id}`, { role });
    const user = this.mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return of(user);
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

  // Transaction management
  getTransactions(): Observable<Transaction[]> {
    // In a real app: return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
    return of(this.mockTransactions);
  }

  getTransactionById(id: string): Observable<Transaction> {
    // In a real app: return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
    const transaction = this.mockTransactions.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return of(transaction);
  }

  updateTransactionStatus(id: string | number, status: 'pending' | 'completed' | 'cancelled' | 'refunded'): Observable<Transaction> {
    // In a real app: return this.http.patch<Transaction>(`${this.apiUrl}/transactions/${id}`, { status });
    const transaction = this.mockTransactions.find(t => t.id === String(id));
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    transaction.status = status;
    return of(transaction);
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
  getReviews(): Observable<Review[]> {
    // In a real app: return this.http.get<Review[]>(`${this.apiUrl}/reviews`);
    return of([]);  // Mock data would come from the ReviewService
  }

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