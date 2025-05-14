import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ListingService } from '../../../services/listing.service';
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
    private userService: UserService,
    private listingService: ListingService
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
          
          // Create arrays of observables for fetching client details and listing details
          const clientDetailsObservables = appointmentsWithClientIds.map(appointment => 
            this.userService.getUserById(appointment.buyerId.toString()).pipe(
              catchError(() => of(null))
            )
          );
          
          const listingDetailsObservables = appointmentsWithClientIds.map(appointment => 
            this.listingService.getListingById(appointment.propertyId.toString()).pipe(
              catchError(() => of(null))
            )
          );
          
          // Execute all requests in parallel
          return forkJoin(
            of(appointmentsWithClientIds),
            forkJoin(clientDetailsObservables),
            forkJoin(listingDetailsObservables)
          );
        })
      ).subscribe({
        next: ([appointments, clientDetails, listingDetails]) => {
          console.log('Fetched appointments:', appointments);
          console.log('Fetched client details:', clientDetails);
          console.log('Fetched listing details:', listingDetails);
          
          // Merge client details and listing details with appointments
          this.appointments = appointments.map((appointment, index) => {
            const clientDetail = clientDetails[index];
            const listingDetail = listingDetails[index];
            
            let updatedAppointment = { ...appointment };
            
            // Update buyer name if client details are available
            if (clientDetail) {
              updatedAppointment.buyerName = `${clientDetail.firstName} ${clientDetail.lastName}`;
            }
            
            // Update property title if listing details are available
            if (listingDetail) {
              updatedAppointment.propertyTitle = listingDetail.title;
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