import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private payments: Payment[] = [
    {
      id: 'pay-001',
      amount: 150000,
      status: 'completed',
      paymentType: 'full',
      method: 'bank_transfer',
      date: '2023-10-15',
      transactionId: 'trans-001',
      propertyId: 'prop-001',
      propertyTitle: 'Modern Apartment in City Center',
      payerId: 'user-002',
      payerName: 'Jane Doe',
      recipientId: 'agent-001',
      recipientName: 'Real Estate Agency',
      reference: 'Property Purchase',
      notes: 'Full payment for property'
    },
    {
      id: 'pay-002',
      amount: 45000,
      status: 'pending',
      paymentType: 'installment',
      method: 'credit_card',
      date: '2023-10-18',
      transactionId: 'trans-002',
      propertyId: 'prop-003',
      propertyTitle: 'Suburban Family Home',
      payerId: 'user-003',
      payerName: 'Michael Smith',
      recipientId: 'agent-002',
      recipientName: 'Home Sellers Inc',
      reference: 'First Installment',
      notes: 'First installment of property payment'
    },
    {
      id: 'pay-003',
      amount: 8500,
      status: 'completed',
      paymentType: 'commission',
      method: 'paypal',
      date: '2023-10-20',
      transactionId: 'trans-003',
      propertyId: 'prop-002',
      propertyTitle: 'Downtown Loft with View',
      payerId: 'agency-001',
      payerName: 'City Homes',
      recipientId: 'agent-003',
      recipientName: 'John Agent',
      reference: 'Agent Commission',
      notes: 'Commission payment for successful sale'
    },
    {
      id: 'pay-004',
      amount: 12000,
      status: 'failed',
      paymentType: 'installment',
      method: 'credit_card',
      date: '2023-10-22',
      transactionId: 'trans-004',
      propertyId: 'prop-004',
      propertyTitle: 'Beachfront Cottage',
      payerId: 'user-005',
      payerName: 'Robert Johnson',
      recipientId: 'agent-001',
      recipientName: 'Real Estate Agency',
      reference: 'Second Installment',
      notes: 'Payment failed due to insufficient funds'
    },
    {
      id: 'pay-005',
      amount: 3500,
      status: 'refunded',
      paymentType: 'fee',
      method: 'bank_transfer',
      date: '2023-10-25',
      transactionId: 'trans-005',
      propertyId: 'prop-005',
      propertyTitle: 'Mountain View Cabin',
      payerId: 'user-006',
      payerName: 'Sarah Wilson',
      recipientId: 'agent-004',
      recipientName: 'Alpine Properties',
      reference: 'Application Fee',
      notes: 'Refunded due to canceled application'
    },
    {
      id: 'pay-006',
      amount: 225000,
      status: 'completed',
      paymentType: 'full',
      method: 'bank_transfer',
      date: '2023-11-01',
      transactionId: 'trans-006',
      propertyId: 'prop-006',
      propertyTitle: 'Luxury Penthouse',
      payerId: 'user-007',
      payerName: 'David Miller',
      recipientId: 'agent-005',
      recipientName: 'Luxury Homes',
      reference: 'Property Purchase',
      notes: 'Full payment for luxury property'
    },
    {
      id: 'pay-007',
      amount: 5000,
      status: 'pending',
      paymentType: 'fee',
      method: 'cash',
      date: '2023-11-05',
      transactionId: 'trans-007',
      propertyId: 'prop-007',
      propertyTitle: 'Urban Studio Apartment',
      payerId: 'user-008',
      payerName: 'Emily Brown',
      recipientId: 'agent-006',
      recipientName: 'Urban Living',
      reference: 'Processing Fee',
      notes: 'Processing fee for rental application'
    }
  ];

  constructor() { }

  getAllPayments(): Observable<Payment[]> {
    // Simulate API delay
    return of([...this.payments]).pipe(delay(800));
  }

  getPaymentById(id: string): Observable<Payment> {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      return of(payment).pipe(delay(300));
    }
    return throwError(() => new Error('Payment not found'));
  }

  createPayment(payment: Omit<Payment, 'id'>): Observable<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: 'pay-' + (Math.floor(Math.random() * 1000)).toString().padStart(3, '0')
    };
    this.payments.push(newPayment);
    return of(newPayment).pipe(delay(500));
  }

  updatePayment(payment: Partial<Payment> & { id: string }): Observable<Payment> {
    const index = this.payments.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      this.payments[index] = { ...this.payments[index], ...payment };
      return of(this.payments[index]).pipe(delay(500));
    }
    return throwError(() => new Error('Payment not found'));
  }

  deletePayment(id: string): Observable<void> {
    const index = this.payments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payments.splice(index, 1);
      return of(void 0).pipe(delay(500));
    }
    return throwError(() => new Error('Payment not found'));
  }
} 