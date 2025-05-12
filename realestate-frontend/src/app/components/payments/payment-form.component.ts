import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrWrapperService } from '../../services/toastr-wrapper.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { 
  PaymentMethod, 
  PaymentRequest, 
  PaymentResponse,
  TransactionStyle 
} from '../../models/payment.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Input() transactionId: string = '';
  @Input() amount: number = 0;
  @Input() transactionStyle: TransactionStyle = TransactionStyle.RENT;
  @Input() initialPaymentMethod: PaymentMethod = PaymentMethod.BANK_TRANSFER;
  @Input() commissionRate: number = 0.10; // 10% default commission rate
  @Input() agentId: string = ''; // Added agent ID input
  
  @Output() paymentComplete = new EventEmitter<PaymentResponse>();
  @Output() paymentCancelled = new EventEmitter<void>();
  
  paymentForm: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  currentUser: any;
  
  // PaymentMethod enum for the template
  paymentMethods = Object.values(PaymentMethod);
  
  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private toastr: ToastrWrapperService,
    private authService: AuthService
  ) {
    // Initialize form with default values
    this.paymentForm = this.fb.group({
      paymentMethod: [this.initialPaymentMethod, Validators.required],
      notes: ['', Validators.maxLength(500)]
    });
    
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
  }
  
  ngOnInit(): void {
    // Update form with input values when component initializes
    this.paymentForm.patchValue({
      paymentMethod: this.initialPaymentMethod
    });
    
    // Calculate commission amount based on total and rate
    this.calculateCommission();
    
    // If no agent ID is provided, use the current user's ID
    if (!this.agentId && this.currentUser) {
      this.agentId = this.currentUser.id;
    }
  }
  
  calculateCommission(): number {
    return this.amount * this.commissionRate;
  }
  
  getFormattedCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = null;
    
    const formValues = this.paymentForm.value;
    
    // Create payment request object
    const paymentRequest: PaymentRequest = {
      transactionId: this.transactionId,
      amount: this.amount,
      paymentMethod: formValues.paymentMethod,
      commissionFee: this.calculateCommission(),
      notes: formValues.notes || '',
      transactionStyle: this.transactionStyle,
      agentId: this.agentId
    };
    
    // Process the payment
    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastr.success('Payment processed successfully');
        this.paymentComplete.emit(response);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to process payment. Please try again.';
        this.toastr.error(this.errorMessage || 'An error occurred');
      }
    });
  }
  
  cancel(): void {
    this.paymentCancelled.emit();
  }
} 