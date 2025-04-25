import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
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

  constructor() { }

  // Get all appointments for a user
  getAppointmentsByUserId(userId: string | number): Observable<Appointment[]> {
    const userAppointments = this.appointments.filter(
      appointment => appointment.buyerId === userId
    );
    // Simulate API call delay
    return of(userAppointments).pipe(delay(800));
  }

  // Get all appointments for an agent
  getAppointmentsByAgentId(agentId: string | number): Observable<Appointment[]> {
    const agentAppointments = this.appointments.filter(
      appointment => appointment.agentId === agentId
    );
    return of(agentAppointments).pipe(delay(800));
  }

  // Get details of a specific appointment
  getAppointmentById(id: string | number): Observable<Appointment | undefined> {
    const appointment = this.appointments.find(app => app.id === id);
    return of(appointment).pipe(delay(500));
  }

  // Create a new appointment
  createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `app-${this.appointments.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.appointments.push(newAppointment);
    return of(newAppointment).pipe(delay(800));
  }

  // Update appointment status
  updateAppointmentStatus(
    id: string | number, 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    reason?: string
  ): Observable<Appointment | undefined> {
    const index = this.appointments.findIndex(app => app.id === id);
    if (index !== -1) {
      this.appointments[index] = {
        ...this.appointments[index],
        status,
        reason: reason || this.appointments[index].reason,
        updatedAt: new Date().toISOString()
      };
      return of(this.appointments[index]).pipe(delay(800));
    }
    return of(undefined).pipe(delay(500));
  }
} 