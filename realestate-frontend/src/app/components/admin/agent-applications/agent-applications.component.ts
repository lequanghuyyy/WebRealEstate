import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgentService, AgentApplication } from '../../../services/agent.service';

@Component({
  selector: 'app-agent-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './agent-applications.component.html',
  styleUrls: ['./agent-applications.component.scss']
})
export class AgentApplicationsComponent implements OnInit {
  applications: AgentApplication[] = [];
  filteredApplications: AgentApplication[] = [];
  selectedApplication: AgentApplication | null = null;
  
  isLoading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  searchQuery: string = '';
  
  // Form for approval/rejection
  applicationForm: FormGroup;
  
  // Modals
  showViewModal: boolean = false;
  showApproveModal: boolean = false;
  showRejectModal: boolean = false;

  constructor(
    private agentService: AgentService,
    private fb: FormBuilder
  ) {
    this.applicationForm = this.fb.group({
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.error = null;
    
    this.agentService.getAllAgentApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading agent applications', err);
        this.error = 'Không thể tải dữ liệu đăng ký. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredApplications = this.applications.filter(app => {
      // Status filter
      if (this.filterStatus !== 'all' && app.status !== this.filterStatus) {
        return false;
      }
      
      // Search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        return app.fullName.toLowerCase().includes(query) ||
               app.email.toLowerCase().includes(query) ||
               app.licenseNumber.toLowerCase().includes(query) ||
               (app.agencyName && app.agencyName.toLowerCase().includes(query));
      }
      
      return true;
    });
  }

  changeFilter(status: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.applyFilters();
  }

  viewApplication(application: AgentApplication): void {
    this.selectedApplication = application;
    this.showViewModal = true;
  }

  openApproveModal(application: AgentApplication): void {
    this.selectedApplication = application;
    this.applicationForm.patchValue({ notes: '' });
    this.showApproveModal = true;
  }

  openRejectModal(application: AgentApplication): void {
    this.selectedApplication = application;
    this.applicationForm.patchValue({ notes: '' });
    this.showRejectModal = true;
  }

  approveApplication(): void {
    if (!this.selectedApplication) return;
    
    const notes = this.applicationForm.value.notes;
    const id = this.selectedApplication.id;
    
    this.agentService.approveAgentApplication(id, notes).subscribe({
      next: (result) => {
        // Update application in the list
        const index = this.applications.findIndex(app => app.id === id);
        if (index !== -1) {
          this.applications[index] = result;
          this.applyFilters();
        }
        
        this.successMessage = `Đã phê duyệt đăng ký của ${result.fullName} thành công!`;
        this.showApproveModal = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error approving application', err);
        this.error = 'Không thể phê duyệt đăng ký. Vui lòng thử lại sau.';
        
        // Hide error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    });
  }

  rejectApplication(): void {
    if (!this.selectedApplication) return;
    
    const notes = this.applicationForm.value.notes;
    if (!notes || notes.trim() === '') {
      this.error = 'Vui lòng cung cấp lý do từ chối đăng ký';
      return;
    }
    
    const id = this.selectedApplication.id;
    
    this.agentService.rejectAgentApplication(id, notes).subscribe({
      next: (result) => {
        // Update application in the list
        const index = this.applications.findIndex(app => app.id === id);
        if (index !== -1) {
          this.applications[index] = result;
          this.applyFilters();
        }
        
        this.successMessage = `Đã từ chối đăng ký của ${result.fullName}.`;
        this.showRejectModal = false;
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error rejecting application', err);
        this.error = 'Không thể từ chối đăng ký. Vui lòng thử lại sau.';
        
        // Hide error after 5 seconds
        setTimeout(() => {
          this.error = null;
        }, 5000);
      }
    });
  }

  closeModals(): void {
    this.showViewModal = false;
    this.showApproveModal = false;
    this.showRejectModal = false;
    this.selectedApplication = null;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}