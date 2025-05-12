import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-agent-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-appointments.component.html',
  styleUrls: ['./agent-appointments.component.scss']
})
export class AgentAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUser: any;
  
  // Filter status
  filterStatus: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' = 'ALL';

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.error = null;
    
    if (this.currentUser && this.currentUser.id) {
      this.appointmentService.getAppointmentsByAgentId(this.currentUser.id).pipe(
        switchMap(appointments => {
          // Store the appointments temporarily
          const appointmentsWithClientIds = appointments;
          
          // Create an array of observables for fetching client details
          const clientDetailsObservables = appointmentsWithClientIds.map(appointment => 
            this.userService.getUserById(appointment.buyerId.toString()).pipe(
              catchError(() => of(null)) // Handle errors for individual client requests
            )
          );
          
          // Execute all client detail requests in parallel
          return forkJoin(
            of(appointmentsWithClientIds),
            forkJoin(clientDetailsObservables)
          );
        })
      ).subscribe({
        next: ([appointments, clientDetails]) => {
          // Merge client details with appointments
          this.appointments = appointments.map((appointment, index) => {
            const clientDetail = clientDetails[index];
            if (clientDetail) {
              // Update the buyerName with the full name from user service
              return {
                ...appointment,
                buyerName: `${clientDetail.firstName} ${clientDetail.lastName}`
              };
            }
            return appointment;
          });
          
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
        return 'PENDING';
      case 'CONFIRMED':
        return 'CONFIRMED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'COMPLETED':
        return 'COMPLETED';
      default:
        return status;
    }
  }

  updateAppointmentStatus(id: string | number, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): void {
    const confirmMessage = status === 'CANCELLED' 
      ? 'Are you sure you want to cancel this appointment?' 
      : `Are you sure you want to mark this appointment as ${status}?`;
      
    if (confirm(confirmMessage)) {
      this.appointmentService.updateAppointmentStatus(id.toString(), status).subscribe({
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
          console.error(`Error updating appointment to ${status}:`, err);
          alert(`Unable to update the appointment status. Please try again later.`);
        }
      });
    }
  }
} 