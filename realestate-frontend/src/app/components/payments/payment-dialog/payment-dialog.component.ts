import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentMethod, PaymentRequest, TransactionStyle } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  loading = false;
  errorMessage = '';
  paymentMethods = Object.values(PaymentMethod);
  
  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, Validators.required],
      notes: ['', [Validators.maxLength(500)]]
    });
  }
  
  ngOnInit(): void {
    // Additional initialization if needed
  }
  
  formatPaymentMethod(method: string): string {
    return method.replace('_', ' ');
  }
  
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }
    
    this.loading = true;
    const formValues = this.paymentForm.value;
    const currentUser = this.authService.getCurrentUser();
    
    // Calculate commission fee - in a real app this might come from the server
    const commissionAmount = this.calculateCommission(formValues.amount, TransactionStyle.SALE);
    
    const paymentRequest: PaymentRequest = {
      transactionId: '',
      amount: formValues.amount,
      paymentMethod: formValues.paymentMethod,
      commissionFee: commissionAmount,
      notes: formValues.notes,
      transactionStyle: TransactionStyle.SALE,
      agentId: currentUser?.id || ''
    };
    
    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Payment processed successfully!');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to process payment';
        console.error('Payment error:', error);
      }
    });
  }
  
  calculateCommission(amount: number, style: TransactionStyle): number {
    // Basic calculation, in a real app this would be more complex or server-based
    const rate = style === TransactionStyle.SALE ? 0.03 : 0.05; // 3% for sales, 5% for rentals
    return amount * rate;
  }
  
  cancel(): void {
    // Simply reset the form
    this.paymentForm.reset({
      paymentMethod: PaymentMethod.BANK_TRANSFER
    });
  }
} 