import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TransactionService, Transaction } from '../../services/transaction.service';
import { RentalStatus } from '../../models/transaction.model';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class RentComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Stats
  totalRentals: number = 0;
  activeRentals: number = 0;
  pendingApprovals: number = 0;
  
  // Expose enum to the template
  rentalStatusEnum = RentalStatus;
  
  // Filter form
  filterForm: FormGroup;
  
  constructor(
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: ['all'],
      dateRange: ['all'],
      propertyType: ['all']
    });
  }
  
  ngOnInit(): void {
    this.loadTransactions();
    
    // Subscribe to form value changes for filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.transactionService.getRentTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.filteredTransactions = [...data];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rental transactions:', error);
        this.errorMessage = 'Failed to load rental data.';
        this.isLoading = false;
      }
    });
  }
  
  calculateStats(): void {
    this.totalRentals = this.transactions.length;
    this.activeRentals = this.transactions.filter(t => t.status === RentalStatus.APPROVED).length;
    this.pendingApprovals = this.transactions.filter(t => t.status === RentalStatus.PENDING).length;
  }
  
  applyFilters(): void {
    const formValues = this.filterForm.value;
    let filtered = [...this.transactions];
    
    // Filter by status
    if (formValues.status !== 'all') {
      filtered = filtered.filter(t => t.status === formValues.status);
    }
    
    // Filter by date range
    if (formValues.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      if (formValues.dateRange === 'month') {
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (formValues.dateRange === 'quarter') {
        // Current quarter
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else if (formValues.dateRange === 'year') {
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= now;
      });
    }
    
    // Filter by property type (based on title for demo)
    if (formValues.propertyType !== 'all') {
      filtered = filtered.filter(t => 
        t.property.title.toLowerCase().includes(formValues.propertyType.toLowerCase())
      );
    }
    
    // Update filtered transactions
    this.filteredTransactions = filtered;
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      status: 'all',
      dateRange: 'all',
      propertyType: 'all'
    });
    
    this.filteredTransactions = [...this.transactions];
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  getRentalDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const months = Math.floor(diffDays / 30);
    
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  renewRental(transactionId: string): void {
    if (confirm('Would you like to renew this rental agreement?')) {
      // In a real app, this would call a service to renew the rental
      alert(`Rental ${transactionId} renewal process initiated`);
    }
  }
  
  downloadAgreement(transactionId: string): void {
    // In a real app, this would call a service to generate and download the agreement
    alert(`Downloading rental agreement for transaction ${transactionId}`);
  }
} 