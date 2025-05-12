import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentConfirmationComponent } from '../payment-confirmation/payment-confirmation.component';
import { PaymentRequest, TransactionStyle } from '../../models/payment.model';

export interface PaymentDialogData {
  transactionId: string;
  amount: number;
  transactionStyle: TransactionStyle;
  commissionFee?: number;
  agentId?: string;
}

@Component({
  selector: 'app-payment-dialog',
  template: `
    <div class="payment-dialog">
      <h2>Process Payment</h2>
      <div class="dialog-content">
        <app-payment-confirmation
          [transactionId]="transactionId"
          [amount]="amount"
          [transactionStyle]="transactionStyle"
          [commissionFee]="commissionFee || 0"
          [agentId]="agentId || ''"
          (confirmed)="onPaymentConfirmed($event)"
          (canceled)="onCancel()">
        </app-payment-confirmation>
      </div>
    </div>
  `,
  styles: [`
    .payment-dialog {
      min-width: 500px;
      padding: 20px;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    PaymentConfirmationComponent
  ]
})
export class PaymentDialogComponent {
  @Input() transactionId!: string;
  @Input() amount!: number;
  @Input() transactionStyle!: TransactionStyle;
  @Input() commissionFee?: number = 0;
  @Input() agentId?: string;
  
  @Output() close = new EventEmitter<any>();
  @Output() confirm = new EventEmitter<PaymentRequest>();

  onPaymentConfirmed(paymentRequest: PaymentRequest): void {
    this.confirm.emit(paymentRequest);
  }

  onCancel(): void {
    this.close.emit();
  }
} 