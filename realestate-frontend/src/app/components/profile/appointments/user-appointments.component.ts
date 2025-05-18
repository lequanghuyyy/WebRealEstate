import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { AuthService } from '../../../services/auth.service';
import { ListingService } from '../../../services/listing.service';
import { UserService } from '../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

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
    private authService: AuthService,
    private listingService: ListingService,
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
      this.appointmentService.getAppointmentsByUserId(this.currentUser.id).pipe(
        switchMap(appointments => {
          // If no appointments found, return empty arrays to skip further API calls
          if (!appointments || appointments.length === 0) {
            return of([[], [], []]);
          }
          
          // Store the appointments temporarily
          const appointmentsWithListingIds = appointments;
          
          // Create arrays of observables for fetching listing details
          const listingDetailsObservables = appointmentsWithListingIds.map(appointment => 
            this.listingService.getListingById(appointment.propertyId.toString()).pipe(
              catchError(() => of(null))
            )
          );
          
          // Create arrays of observables for fetching agent details
          const agentDetailsObservables = appointmentsWithListingIds.map(appointment => 
            this.userService.getUserById(appointment.agentId.toString()).pipe(
              catchError(() => of(null))
            )
          );
          
          // Execute all requests in parallel
          return forkJoin(
            of(appointmentsWithListingIds),
            forkJoin(listingDetailsObservables),
            forkJoin(agentDetailsObservables)
          );
        })
      ).subscribe({
        next: ([appointments, listingDetails, agentDetails]) => {
          console.log('Fetched appointments:', appointments);
          
          // Handle the case when no appointments are found
          if (!appointments || appointments.length === 0) {
            this.appointments = [];
            this.applyFilter();
            this.isLoading = false;
            return;
          }
          
          console.log('Fetched listing details:', listingDetails);
          console.log('Fetched agent details:', agentDetails);
          
          // Merge listing and agent details with appointments
          this.appointments = appointments.map((appointment, index) => {
            const listingDetail = listingDetails[index];
            const agentDetail = agentDetails[index];
            
            let updatedAppointment = { ...appointment };
            
            // Update property title if listing details are available
            if (listingDetail) {
              updatedAppointment.propertyTitle = listingDetail.title;
            }
            
            // Update agent name if agent details are available
            if (agentDetail) {
              updatedAppointment.agentName = agentDetail.firstName + ' ' + agentDetail.lastName || agentDetail.username || 'Agent';
            }
            
            return updatedAppointment;
          });
          
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Unable to load appointment data. Please try again later.';
          this.isLoading = false;
          console.error('Error loading appointments:', err);
        },
        complete: () => {
          // Ensure loading is set to false when the observable completes
          this.isLoading = false;
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
      case 'COMFIRMED':
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
      case 'COMFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }

  canDelete(status: string): boolean {
    return status === 'COMPLETED' || status === 'CANCELLED' || status === 'CONFIRMED' || status === 'COMFIRMED';
  }
  
  isPending(status: string): boolean {
    return status === 'PENDING';
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

  deleteAppointment(id: string): void {
    if (confirm('Are you sure you want to permanently delete this appointment?')) {
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => {
          // Remove the deleted appointment from the arrays
          this.appointments = this.appointments.filter(app => app.id !== id);
          this.applyFilter(); // Update filtered appointments
        },
        error: (err) => {
          console.error('Error deleting appointment:', err);
          alert('Unable to delete the appointment. Please try again later.');
        }
      });
    }
  }
} 