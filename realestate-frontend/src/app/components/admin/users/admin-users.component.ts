import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Filter controls
  searchControl = new FormControl('');
  roleFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Modal state
  showUserModal: boolean = false;
  selectedUser: User | null = null;
  
  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
    
    // Setup search and filter listeners
    this.searchControl.valueChanges.subscribe(term => {
      this.filterUsers();
    });
    
    this.roleFilter.valueChanges.subscribe(role => {
      this.filterUsers();
    });
    
    this.statusFilter.valueChanges.subscribe(status => {
      this.filterUsers();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.isLoading = false;
        console.error('Error loading users:', err);
      }
    });
  }
  
  filterUsers(): void {
    let filtered = [...this.users];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply role filter
    const roleValue = this.roleFilter.value;
    if (roleValue && roleValue !== 'all') {
      filtered = filtered.filter(user => user.role === roleValue);
    }
    
    // Apply status filter
    const statusValue = this.statusFilter.value;
    if (statusValue && statusValue !== 'all') {
      filtered = filtered.filter(user => user.status === statusValue);
    }
    
    this.filteredUsers = filtered;
  }

  openUserModal(user: User): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }
  
  closeUserModal(): void {
    this.selectedUser = null;
    this.showUserModal = false;
  }
  
  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): void {
    this.adminService.updateUserStatus(userId, status).subscribe({
      next: (updatedUser) => {
        // Update user in the list
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers(); // Refresh filtered list
        }
      },
      error: (err) => {
        console.error('Error updating user status:', err);
        // Show error message to user
      }
    });
  }
  
  updateUserRole(userId: string, role: 'admin' | 'agent' | 'user'): void {
    this.adminService.updateUserRole(userId, role).subscribe({
      next: (updatedUser) => {
        // Update user in the list
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers(); // Refresh filtered list
        }
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        // Show error message to user
      }
    });
  }
  
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'agent':
        return 'bg-warning';
      default:
        return 'bg-info';
    }
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'suspended':
        return 'bg-danger';
      default:
        return 'bg-warning';
    }
  }
  
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 