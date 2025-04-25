export interface Appointment {
  id: string | number;
  propertyId: string | number;
  propertyTitle: string;
  propertyImage?: string;
  buyerId: string | number;
  buyerName: string;
  agentId: string | number;
  agentName: string;
  appointmentDate: string | Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  appointmentTime: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  reason?: string; // Lý do nếu bị từ chối
  meetingType: 'online' | 'in-person';
  meetingLocation?: string; // Địa điểm nếu gặp trực tiếp
  meetingLink?: string; // Link nếu online
} 