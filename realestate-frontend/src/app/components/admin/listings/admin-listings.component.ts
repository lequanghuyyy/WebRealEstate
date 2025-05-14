import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ListingService } from '../../../services/listing.service';
import { ListingResponse, ListingStatus, ListingType, PageDto } from '../../../models/listing.model';

@Component({
  selector: 'app-admin-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-listings">
      <div class="content-header">
        <h1 class="page-title">Listings Management</h1>
        <p class="subtitle">Approve and moderate property listings</p>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="isLoading" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading listings...</p>
      </div>
      
      <!-- Error state -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        <button (click)="loadListings()" class="btn btn-sm btn-outline-danger ms-2">Retry</button>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!isLoading && !errorMessage && (!listings || listings.length === 0)" class="alert alert-info">
        <i class="fas fa-info-circle"></i> No property listings found.
      </div>
      
      <!-- Listings table -->
      <div *ngIf="!isLoading && !errorMessage && listings && listings.length > 0" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let listing of listings">
                  <td>{{ listing.id | slice:0:8 }}...</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div>
                        <div class="fw-bold">{{ listing.title }}</div>
                        <small>{{ listing.address }}, {{ listing.city }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span [ngClass]="{'badge bg-primary': listing.type === 'SALE', 'badge bg-success': listing.type === 'RENT'}">
                      {{ listing.type }}
                    </span>
                  </td>
                  <td>{{ listing.price | currency }}</td>
                  <td>
                    <span [ngClass]="{
                      'badge bg-success': listing.status === 'AVAILABLE',
                      'badge bg-warning text-dark': listing.status === 'PENDING',
                      'badge bg-info': listing.status === 'SOLD' || listing.status === 'RENTED',
                      'badge bg-secondary': listing.status === 'DELISTED'
                    }">
                      {{ listing.status }}
                    </span>
                  </td>
                  <td>{{ listing.ownerId | slice:0:8 }}...</td>
                  <td>{{ listing.createdAt | date }}</td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" [routerLink]="['/property', listing.id]">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" [routerLink]="['/admin/listings/edit', listing.id]">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" (click)="approveListing(listing.id)" *ngIf="listing.status === 'PENDING'">
                        <i class="fas fa-check"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteListing(listing.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span>Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} listings</span>
            </div>
            <div>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="form-select form-select-sm d-inline-block me-2" style="width: auto;">
                <option [value]="5">5 per page</option>
                <option [value]="10">10 per page</option>
                <option [value]="20">20 per page</option>
                <option [value]="50">50 per page</option>
              </select>
              
              <nav aria-label="Listings pagination">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" [class.disabled]="currentPage === 1">
                    <a class="page-link" href="javascript:void(0)" (click)="goToPage(currentPage - 1)">Previous</a>
                  </li>
                  
                  <ng-container *ngFor="let page of getPaginationRange()">
                    <li class="page-item" [class.active]="page === currentPage">
                      <a class="page-link" href="javascript:void(0)" (click)="goToPage(page)">{{ page }}</a>
                    </li>
                  </ng-container>
                  
                  <li class="page-item" [class.disabled]="currentPage === totalPages">
                    <a class="page-link" href="javascript:void(0)" (click)="goToPage(currentPage + 1)">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-listings {
      padding: 1rem;
    }
    
    .content-header {
      margin-bottom: 1.5rem;
    }
    
    .page-title {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .subtitle {
      color: #6c757d;
      margin-bottom: 0;
    }
  `]
})
export class AdminListingsComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string | null = null;
  listings: ListingResponse[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Make Math available in template
  Math = Math;
  
  constructor(
    private adminService: AdminService,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    this.loadListings();
  }
  
  loadListings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.listingService.getListingsPaged(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageDto<ListingResponse>) => {
          this.listings = response.items;
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading listings:', error);
          this.errorMessage = 'Failed to load listings. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadListings();
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadListings();
  }
  
  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }
  
  approveListing(id: string): void {
    if (confirm('Are you sure you want to approve this listing?')) {
      this.isLoading = true;
      const statusRequest = { status: ListingStatus.AVAILABLE };
      
      this.listingService.updateListingStatus(id, statusRequest)
        .subscribe({
          next: () => {
            this.loadListings();
          },
          error: (error) => {
            console.error('Error approving listing:', error);
            this.errorMessage = 'Failed to approve listing. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }
  
  deleteListing(id: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.listingService.deleteListing(id)
        .subscribe({
          next: () => {
            this.loadListings();
          },
          error: (error) => {
            console.error('Error deleting listing:', error);
            this.errorMessage = 'Failed to delete listing. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }
} 