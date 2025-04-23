import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Transaction } from '../../../services/transaction.service';
import { PropertyService } from '../../../services/property.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Property } from '../../../models/property.model';

interface PropertyItem {
  id: string | number;
  title: string;
  image: string;
}

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class TransactionDialogComponent implements OnInit {
  @Input() transaction: Transaction | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Partial<Transaction>>();
  
  transactionForm: FormGroup;
  properties: PropertyItem[] = [];
  isLoading: boolean = true;
  
  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService
  ) {
    this.transactionForm = this.fb.group({
      propertyId: ['', Validators.required],
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      type: ['sale', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      commission: [0, [Validators.required, Validators.min(0)]],
      status: ['pending', Validators.required],
      paymentStatus: ['pending', Validators.required],
      date: [this.getCurrentDate(), Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadProperties();
    
    if (this.transaction) {
      // We're editing an existing transaction
      this.transactionForm.patchValue({
        propertyId: this.transaction.property.id,
        clientName: this.transaction.client.name,
        clientEmail: this.transaction.client.email,
        type: this.transaction.type,
        amount: this.transaction.amount,
        commission: this.transaction.commission,
        status: this.transaction.status,
        paymentStatus: this.transaction.paymentStatus,
        date: this.transaction.date
      });
    }
  }
  
  loadProperties(): void {
    this.isLoading = true;
    
    // Load properties from PropertyService - using getAllProperties instead of getProperties
    this.propertyService.getAllProperties().subscribe({
      next: (properties: Property[]) => {
        // Map to the format we need
        this.properties = properties.map((p: Property) => ({
          id: p.id,
          title: p.title,
          image: p.images && p.images.length > 0 ? p.images[0] : 'assets/images/properties/default.jpg'
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading properties:', error);
        this.isLoading = false;
        // Fallback to empty array
        this.properties = [];
      }
    });
  }
  
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
  
  saveTransaction(): void {
    if (this.transactionForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const formValue = this.transactionForm.value;
    const property = this.properties.find(p => p.id === formValue.propertyId);
    
    if (!property) {
      console.error('Selected property not found!');
      return;
    }
    
    const transactionData: Partial<Transaction> = {
      property: {
        id: property.id,
        title: property.title,
        image: property.image
      },
      client: {
        name: formValue.clientName,
        email: formValue.clientEmail
      },
      type: formValue.type,
      amount: formValue.amount,
      commission: formValue.commission,
      status: formValue.status,
      paymentStatus: formValue.paymentStatus,
      date: formValue.date
    };
    
    // If editing, include the ID
    if (this.transaction) {
      transactionData.id = this.transaction.id;
    }
    
    this.save.emit(transactionData);
    this.closeDialog();
  }
  
  // Utility function to get current date in YYYY-MM-DD format
  private getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 