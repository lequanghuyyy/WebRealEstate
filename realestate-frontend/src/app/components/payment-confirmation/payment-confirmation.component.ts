import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentMethod, PaymentRequest, TransactionStyle } from '../../models/payment.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PaymentConfirmationComponent implements OnInit {
  @Input() transactionId: string = '';
  @Input() amount: number = 0;
  @Input() transactionStyle: TransactionStyle = TransactionStyle.SALE;
  @Input() commissionFee: number = 0;
  @Input() agentId: string = '';
  @Input() buyerId: string = '';
  @Output() confirmed = new EventEmitter<PaymentRequest>();
  @Output() canceled = new EventEmitter<void>();

  paymentForm: FormGroup;
  paymentMethods = Object.values(PaymentMethod);
  isProcessing = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: [PaymentMethod.BANK_TRANSFER, Validators.required],
      notes: ['']
    });
    
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Initialize form with calculated commission
    if (this.commissionFee <= 0) {
      // Calculate default commission if not provided
      this.commissionFee = this.transactionStyle === TransactionStyle.SALE 
        ? this.amount * 0.05 // 5% for sales
        : this.amount * 0.1;  // 10% for rentals
    }
    
    // If no agent ID provided, use current user's ID
    if (!this.agentId && this.currentUser) {
      this.agentId = this.currentUser.id;
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid && !this.isProcessing) {
      this.isProcessing = true;
      
      const paymentRequest: PaymentRequest = {
        transactionId: this.transactionId,
        amount: this.amount,
        paymentMethod: this.paymentForm.value.paymentMethod,
        commissionFee: this.commissionFee,
        notes: this.paymentForm.value.notes,
        transactionStyle: this.transactionStyle,
        agentId: this.agentId,
        buyerId: this.buyerId
      };
      
      this.confirmed.emit(paymentRequest);
    }
  }

  cancel(): void {
    this.canceled.emit();
  }

  // Helper method to format payment method display
  formatPaymentMethod(method: string): string {
    return method.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 