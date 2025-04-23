export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'pending' | 'resolved' | 'spam';
  category: 'inquiry' | 'support' | 'feedback' | 'complaint' | 'other';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  notes?: string;
} 