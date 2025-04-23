import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="admin-listings">
      <div class="content-header">
        <h1 class="page-title">Listings Management</h1>
        <p class="subtitle">Approve and moderate property listings</p>
      </div>
      
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i> 
        Listings management features are under development. This section will allow you to approve, reject, or hide property listings.
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
  
  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Will implement listing management functionality
  }
} 