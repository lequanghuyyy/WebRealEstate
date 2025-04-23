import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="admin-contacts">
      <div class="content-header">
        <h1 class="page-title">Contacts Management</h1>
        <p class="subtitle">Manage and respond to user inquiries</p>
      </div>
      
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i> 
        Contacts management features are under development. This section will allow you to manage user inquiries, support requests, and other communications.
      </div>
    </div>
  `,
  styles: [`
    .admin-contacts {
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
export class AdminContactsComponent implements OnInit {
  isLoading: boolean = false;
  
  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Will implement contacts management functionality
  }
} 