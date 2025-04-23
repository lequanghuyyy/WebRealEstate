import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="admin-reviews">
      <div class="content-header">
        <h1 class="page-title">Reviews Management</h1>
        <p class="subtitle">Moderate and manage property reviews</p>
      </div>
      
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i> 
        Reviews management features are under development. This section will allow you to moderate, approve, or reject property reviews.
      </div>
    </div>
  `,
  styles: [`
    .admin-reviews {
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
export class AdminReviewsComponent implements OnInit {
  isLoading: boolean = false;
  
  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Will implement reviews management functionality
  }
} 