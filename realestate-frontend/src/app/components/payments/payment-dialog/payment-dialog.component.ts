import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentMethod, PaymentRequest, TransactionStyle } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { TransactionService } from '../../../services/transaction.service';

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
  @Input() transactionId: string = '';
  
  paymentForm: FormGroup;
  loading = false;
  errorMessage = '';
  paymentMethods = Object.values(PaymentMethod);
  buyerId: string = '';
  agentId: string = '';
  transactionStyle: TransactionStyle = TransactionStyle.SALE;
  
  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private authService: AuthService,
    private transactionService: TransactionService
  ) {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: [PaymentMethod.BANK_TRANSFER, Validators.required],
      notes: ['', [Validators.maxLength(500)]]
    });
  }
  
  ngOnInit(): void {
    if (this.transactionId) {
      this.loadTransactionData();
    }
  }
  
  loadTransactionData(): void {
    this.loading = true;
    this.transactionService.getTransactionById(this.transactionId).subscribe({
      next: (transaction) => {
        if (transaction) {
          // Set the agent ID from the transaction
          this.agentId = transaction.agentId?.toString() || '';
          this.buyerId = transaction.buyerId?.toString() || '';
          this.transactionStyle = transaction.type === 'sale' ? 
            TransactionStyle.SALE : TransactionStyle.RENT;
            
          // Update form values if needed
          this.paymentForm.patchValue({
            amount: transaction.amount || 0
          });
        } else {
          this.errorMessage = 'Transaction not found';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading transaction data';
        console.error('Error loading transaction:', error);
        this.loading = false;
      }
    });
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
    
    // Calculate commission fee - in a real app this might come from the server
    const commissionAmount = this.calculateCommission(formValues.amount, this.transactionStyle);
    
    const paymentRequest: PaymentRequest = {
      transactionId: this.transactionId,
      amount: formValues.amount,
      paymentMethod: formValues.paymentMethod,
      commissionFee: commissionAmount,
      notes: formValues.notes,
      transactionStyle: this.transactionStyle,
      agentId: this.agentId, // Sử dụng agentId từ transaction
      buyerId: this.buyerId
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