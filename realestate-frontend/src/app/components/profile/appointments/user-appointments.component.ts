import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-appointments.component.html',
  styleUrls: ['./user-appointments.component.scss']
})
export class UserAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUser: any;
  
  // Filter status
  filterStatus: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'ALL';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.error = null;
    
    if (this.currentUser && this.currentUser.id) {
      this.appointmentService.getAppointmentsByUserId(this.currentUser.id).subscribe({
        next: (data) => {
          this.appointments = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Unable to load appointment data. Please try again later.';
          this.isLoading = false;
          console.error('Error loading appointments:', err);
        }
      });
    } else {
      this.error = 'User information not found.';
      this.isLoading = false;
    }
  }

  applyFilter(): void {
    if (this.filterStatus === 'ALL') {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(
        appointment => appointment.status === this.filterStatus
      );
    } 
  }

  changeFilter(status: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      case 'COMPLETED':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }

  cancelAppointment(id: string | number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.updateAppointmentStatus(id.toString(), 'CANCELLED').subscribe({
        next: (updated) => {
          if (updated) {
            // Update the list
            const index = this.appointments.findIndex(app => app.id === id);
            if (index !== -1) {
              this.appointments[index] = updated;
              this.applyFilter();
            }
          }
        },
        error: (err) => {
          console.error('Error cancelling appointment:', err);
          alert('Unable to cancel the appointment. Please try again later.');
        }
      });
    }
  }
} 