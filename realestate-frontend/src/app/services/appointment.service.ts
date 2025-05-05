import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { environment } from '../../environments/environment';
import { 
  AppointmentRequest, 
  AppointmentResponse, 
  AppointmentStatus,
  BaseResponse 
} from '../models/user-experience.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.userExperienceServiceUrl}/appointments`;
  
  // Mock data for appointments
  private appointments: Appointment[] = [
    {
      id: 'app-001',
      propertyId: 'prop-001',
      propertyTitle: 'Modern Apartment in City Center',
      propertyImage: 'assets/images/properties/property-1.jpg',
      buyerId: 'user-002',
      buyerName: 'Jane Doe',
      agentId: 'agent-001',
      agentName: 'John Agent',
      appointmentDate: '2023-12-01',
      appointmentTime: '10:00',
      status: 'confirmed',
      notes: 'Meeting to discuss purchase options',
      createdAt: '2023-11-25',
      meetingType: 'in-person',
      meetingLocation: 'At the property'
    },
    {
      id: 'app-002',
      propertyId: 'prop-002',
      propertyTitle: 'Suburban Family Home',
      propertyImage: 'assets/images/properties/property-2.jpg',
      buyerId: 'user-002',
      buyerName: 'Jane Doe',
      agentId: 'agent-002',
      agentName: 'Sarah Agent',
      appointmentDate: '2023-12-03',
      appointmentTime: '14:30',
      status: 'pending',
      notes: 'Need to confirm available time slots',
      createdAt: '2023-11-27',
      meetingType: 'online',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 'app-003',
      propertyId: 'prop-003',
      propertyTitle: 'Luxury Villa with Pool',
      propertyImage: 'assets/images/properties/property-3.jpg',
      buyerId: 'user-002',
      buyerName: 'Jane Doe',
      agentId: 'agent-003',
      agentName: 'Michael Agent',
      appointmentDate: '2023-11-28',
      appointmentTime: '11:00',
      status: 'completed',
      notes: 'Viewing completed successfully',
      createdAt: '2023-11-20',
      updatedAt: '2023-11-28',
      meetingType: 'in-person',
      meetingLocation: 'At the property'
    },
    {
      id: 'app-004',
      propertyId: 'prop-004',
      propertyTitle: 'Downtown Loft',
      propertyImage: 'assets/images/properties/property-4.jpg',
      buyerId: 'user-002',
      buyerName: 'Jane Doe',
      agentId: 'agent-001',
      agentName: 'John Agent',
      appointmentDate: '2023-12-05',
      appointmentTime: '16:00',
      status: 'cancelled',
      notes: 'Scheduling conflict',
      reason: 'Agent unavailable at requested time',
      createdAt: '2023-11-26',
      updatedAt: '2023-11-27',
      meetingType: 'in-person',
      meetingLocation: 'At the property'
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all appointments for a user
  getAppointmentsByUserId(userId: string): Observable<Appointment[]> {
    // Use API endpoint when backend is ready
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/br/${userId}`).pipe(
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  // Get all appointments for an agent
  getAppointmentsByAgentId(agentId: string): Observable<Appointment[]> {
    // Use API endpoint when backend is ready
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/agent/${agentId}`).pipe(
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  // Get appointments by status
  getAppointmentsByAgentIdAndStatus(
    agentId: string, 
    status: AppointmentStatus
  ): Observable<Appointment[]> {
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/agent/${agentId}/status/${status}`).pipe(
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  getAppointmentsByBrIdAndStatus(
    brId: string, 
    status: AppointmentStatus
  ): Observable<Appointment[]> {
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/br/${brId}/status/${status}`).pipe(
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  // Get details of a specific appointment
  getAppointmentById(id: string): Observable<Appointment> {
    // Use API endpoint when backend is ready
    return this.http.get<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  // Create a new appointment
  createAppointment(appointmentData: any): Observable<Appointment> {
    // Map to API format
    const request: AppointmentRequest = {
      brId: appointmentData.buyerId,
      agentId: appointmentData.agentId,
      listingId: appointmentData.propertyId,
      day: new Date(appointmentData.appointmentDate),
      time: appointmentData.appointmentTime,
      brNote: appointmentData.notes,
      status: AppointmentStatus.PENDING
    };
    
    // Use API endpoint when backend is ready
    return this.http.post<BaseResponse<AppointmentResponse>>(this.apiUrl, request).pipe(
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  // Update an appointment
  updateAppointment(id: string, appointmentData: any): Observable<Appointment> {
    // Map to API format
    const request: AppointmentRequest = {
      id: id,
      brId: appointmentData.buyerId,
      agentId: appointmentData.agentId,
      listingId: appointmentData.propertyId,
      day: new Date(appointmentData.appointmentDate),
      time: appointmentData.appointmentTime,
      brNote: appointmentData.notes,
      status: appointmentData.status as AppointmentStatus
    };
    
    return this.http.put<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  // Update appointment status
  updateAppointmentStatus(
    id: string, 
    status: string
  ): Observable<Appointment> {
    // Map string status to enum
    const appointmentStatus = status as unknown as AppointmentStatus;
    
    // Use API endpoint when backend is ready
    return this.http.patch<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/status/${appointmentStatus}`, {}).pipe(
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  // Delete an appointment
  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void)
    );
  }

  // Helper method to map AppointmentResponse to Appointment
  private mapAppointmentResponseToAppointment(response: AppointmentResponse): Appointment {
    return {
      id: response.id,
      propertyId: response.listingId,
      propertyTitle: response.propertyTitle || 'Property',
      propertyImage: response.propertyImage || 'assets/images/properties/default.jpg',
      buyerId: response.brId,
      buyerName: response.buyerName || 'Client',
      agentId: response.agentId,
      agentName: response.agentName || 'Agent',
      appointmentDate: response.day,
      appointmentTime: response.time,
      status: response.status.toLowerCase() as any,
      notes: response.brNote || '',
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      meetingType: 'in-person'
    };
  }

  // Helper method to map AppointmentResponse[] to Appointment[]
  private mapAppointmentResponsesToAppointments(responses: AppointmentResponse[]): Appointment[] {
    return responses.map(response => this.mapAppointmentResponseToAppointment(response));
  }
} 