import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
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
  constructor(private http: HttpClient) { }
  

  getAppointmentsByUserId(userId: string): Observable<Appointment[]> {
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/br/${userId}`).pipe(
      tap(response => console.log('API Response (User Appointments):', response)),
      map(response => this.mapAppointmentResponsesToAppointments(response.data))
    );
  }

  getAppointmentsByAgentId(agentId: string): Observable<Appointment[]> {
    console.log('Fetching appointments for agent ID:', agentId);
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/agent/${agentId}`).pipe(
      tap(response => console.log('API Response (Agent Appointments):', response)),
      map(response => this.mapAppointmentResponsesToAppointments(response.data || [])),
      catchError(error => {
        console.error('Error fetching appointments:', error);
        return of([]);
      })
    );
  }

  getAppointmentsByAgentIdAndStatus(
    agentId: string, 
    status: AppointmentStatus
  ): Observable<Appointment[]> {
    return this.http.get<BaseResponse<AppointmentResponse[]>>(`${this.apiUrl}/agent/${agentId}/status/${status}`).pipe(
      map(response => this.mapAppointmentResponsesToAppointments(response.data || [])),
      catchError(error => {
        console.error('Error fetching appointments by status:', error);
        return of([]);
      })
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

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  createAppointment(appointmentData: any): Observable<Appointment> {
    console.log('Creating appointment with data:', appointmentData);
    
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
      }),
      catchError(error => {
        console.error('Error creating appointment:', error);
        throw error;
      })
    );
  }

  updateAppointment(id: string, appointmentData: any): Observable<Appointment> {
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
      map(response => this.mapAppointmentResponseToAppointment(response.data)),
      catchError(error => {
        console.error('Error updating appointment:', error);
        throw error;
      })
    );
  }

  updateAppointmentStatus(
    id: string, 
    status: string
  ): Observable<Appointment> {
    let appointmentStatus = status as unknown as AppointmentStatus;
    
    if (status === 'COMFIRMED') {
      appointmentStatus = AppointmentStatus.CONFIRMED;
      console.log('Corrected status from COMFIRMED to CONFIRMED');
    }
    
    console.log(`Updating appointment ${id} to status ${appointmentStatus}`);
  
    return this.http.patch<BaseResponse<AppointmentResponse>>(`${this.apiUrl}/${id}/status/${appointmentStatus}`, {}).pipe(
      tap(response => console.log('Status update response:', response)),
      map(response => this.mapAppointmentResponseToAppointment(response.data))
    );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void)
    );
  }

  private mapAppointmentResponseToAppointment(response: AppointmentResponse): Appointment {
    if (!response) {
      console.warn('Invalid appointment response received:', response);
      return {
        id: '',
        propertyId: '',
        propertyTitle: 'No data',
        buyerId: '',
        buyerName: 'No data',
        agentId: '',
        agentName: 'No data',
        appointmentDate: new Date(),
        appointmentTime: '',
        status: 'PENDING',
        notes: '',
        createdAt: new Date(),
        meetingType: 'in-person'
      };
    }
    
    return {
      id: response.id || '',
      propertyId: response.listingId || '',
      propertyTitle: response.propertyTitle || 'Property details loading...',
      buyerId: response.brId || '',
      buyerName: response.buyerName || 'Client details loading...',
      agentId: response.agentId || '',
      agentName: response.agentName || '',
      appointmentDate: response.day || new Date().toISOString(),
      appointmentTime: response.time || '',
      status: response.status || AppointmentStatus.PENDING,
      notes: response.brNote || '',
      createdAt: response.createdAt || new Date().toISOString(),
      updatedAt: response.updatedAt,
      reason: response.cancelReason || '',
      meetingType: response.meetingType || 'in-person',
      meetingLocation: response.meetingLocation || '',
      meetingLink: response.meetingLink || ''
    };
  }

  private mapAppointmentResponsesToAppointments(responses: AppointmentResponse[]): Appointment[] {
    console.log('Mapping multiple appointment responses:', responses);
    
    if (!responses || !Array.isArray(responses)) {
      console.warn('Invalid appointment responses received:', responses);
      return [];
    }
    
    return responses.map(response => this.mapAppointmentResponseToAppointment(response));
  }
} 