import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
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
  private apiUrl = '/api/ux/appointments';
  // private apiUrl = `${environment.userExperienceServiceUrl}/appointments`;
  
  // Mock data for appointments
  constructor(private http: HttpClient) { }

  // Get all appointments for a user
  getAppointmentsByUserId(userId: string): Observable<Appointment[]> {
    // Use API endpoint when backend is ready
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/br/${userId}`).pipe(
      tap(response => console.log('API Response (User Appointments):', response)),
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  // Get all appointments for an agent
  getAppointmentsByAgentId(agentId: string): Observable<Appointment[]> {
    // Use API endpoint when backend is ready
    console.log('Fetching appointments for agent ID:', agentId);
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/agent/${agentId}`).pipe(
      tap(response => console.log('API Response (Agent Appointments):', response)),
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
    console.log('Creating appointment with data:', appointmentData);
    
    // Map to API format
    const request: AppointmentRequest = {
      brId: appointmentData.buyerId,
      agentId: appointmentData.agentId,
      listingId: appointmentData.propertyId,
      day: new Date(appointmentData.appointmentDate),
      time: appointmentData.appointmentTime,
      brNote: appointmentData.notes || '',
      status: AppointmentStatus.PENDING
    };
    
    console.log('API request:', request);
    console.log('Endpoint:', this.apiUrl);
    
    return this.http.post<BaseResponse<AppointmentResponse>>(this.apiUrl, request).pipe(
      map(response => {
        console.log('API response:', response);
        return this.mapAppointmentResponseToAppointment(response.data);
      })
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

  updateAppointmentStatus(
    id: string, 
    status: string
  ): Observable<Appointment> {
    // Ensure status is properly formatted
    let appointmentStatus = status as unknown as AppointmentStatus;
    
    // Correct any typos in status
    if (status === 'COMFIRMED') {
      appointmentStatus = AppointmentStatus.CONFIRMED;
      console.log('Corrected status from COMFIRMED to CONFIRMED');
    }
    
    console.log(`Updating appointment ${id} to status ${appointmentStatus}`);
  
    // Use API endpoint when backend is ready
    return this.http.patch<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/status/${appointmentStatus}`, {}).pipe(
      tap(response => console.log('Status update response:', response)),
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
    console.log('Mapping appointment response:', response);
    
    // Ensure the status is correctly handled
    let status = response.status || AppointmentStatus.PENDING;
    console.log('Original status:', status);
    
    // Fix any typos in status
    if (status.toString() === 'COMFIRMED') {
      status = AppointmentStatus.CONFIRMED;
      console.log('Corrected misspelled status from COMFIRMED to CONFIRMED');
    }
    
    const appointment: Appointment = {
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
      status: status, // Use the corrected status
      notes: response.brNote || '',
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      meetingType: 'in-person'
    };
    
    console.log('Mapped appointment:', appointment);
    return appointment;
  }

  // Helper method to map AppointmentResponse[] to Appointment[]
  private mapAppointmentResponsesToAppointments(responses: AppointmentResponse[]): Appointment[] {
    console.log('Mapping multiple appointment responses:', responses);
    return responses.map(response => this.mapAppointmentResponseToAppointment(response));
  }
} 