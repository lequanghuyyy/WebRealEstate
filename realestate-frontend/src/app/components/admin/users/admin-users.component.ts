import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, UserStatus, Role } from '../../../services/admin.service';
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
  
  // Expose enums to template
  UserStatus = UserStatus;
  Role = Role;
  
  // Filter controls
  searchControl = new FormControl('');
  roleFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Modal states
  showUserModal: boolean = false;
  showDeleteConfirmModal: boolean = false;
  selectedUser: User | null = null;
  userToDelete: User | null = null;
  isDeleting: boolean = false;
  
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
        // Process users to handle role format
        this.users = users.map(user => {
          // If user has roles array, use it to set the role property
          if (user.roles && user.roles.length > 0) {
            if (user.roles.includes(Role.AGENT)) {
              user.role = Role.AGENT;
            } else if (user.roles.includes(Role.ADMIN)) {
              user.role = Role.ADMIN;
            } else if (user.roles.includes(Role.BUYER) && user.roles.includes(Role.RENTER)) {
              user.role = 'BUYER & RENTER';
            } 
          }
          return user;
        });
        
        this.filteredUsers = [...this.users];
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
      filtered = filtered.filter(user => {
        if (roleValue === 'BUYER & RENTER') {
          return user.role === 'BUYER & RENTER' || 
                 (user.roles && user.roles.includes(Role.BUYER) && user.roles.includes(Role.RENTER));
        }
        return user.role === roleValue || (user.roles && user.roles.includes(roleValue));
      });
    }
    
    // Apply status filter
    const statusValue = this.statusFilter.value;
    if (statusValue && statusValue !== 'all') {
      filtered = filtered.filter(user => user.status === statusValue);
    }
    
    this.filteredUsers = filtered;
  }

  // Get user initials from name
  getInitials(name: string): string {
    if (!name) return '??';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '??';
    
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  openUserModal(user: User): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }
  
  closeUserModal(): void {
    this.selectedUser = null;
    this.showUserModal = false;
  }
  
  confirmDeleteUser(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirmModal = true;
    // Hide the user modal if it's open
    this.showUserModal = false;
  }
  
  closeDeleteConfirmModal(): void {
    this.userToDelete = null;
    this.showDeleteConfirmModal = false;
  }
  
  deleteUser(): void {
    if (!this.userToDelete) return;
    
    this.isDeleting = true;
   
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        // Remove the deleted user from the lists
        this.users = this.users.filter(u => u.id !== this.userToDelete?.id);
        this.filterUsers(); // Refresh filtered list
        
        // Close the modal and reset state
        this.userToDelete = null;
        this.showDeleteConfirmModal = false;
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.isDeleting = false;
        // Show error message but keep modal open
        this.error = 'Failed to delete user. Please try again.';
      }
    });
  }
  
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case Role.ADMIN:
        return 'bg-danger';
      case Role.AGENT:
        return 'bg-warning';
      case 'BUYER & RENTER':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'bg-success';
      case UserStatus.PENDING_APPROVAL:
        return 'bg-warning';
      case UserStatus.REJECTED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Helper method to get combined roles for display
  getUserRoles(user: User): string {
    if (user.roles && user.roles.length > 0) {
      return user.roles.join(', ');
    }
    return user.role || 'User';
  }
} 