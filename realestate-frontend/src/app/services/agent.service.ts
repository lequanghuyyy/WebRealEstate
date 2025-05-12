import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Agent } from '../models/agent.model';
import { environment } from '../../environments/environment';

export interface AgentApplication {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  agencyName: string | null;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: string[];
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/agents`;
  private mockAgents: Agent[] = [
    {
      id: 'a1',
      name: 'John Smith',
      email: 'john@realestatepro.com',
      phone: '(512) 555-1234',
      photo: '/assets/images/agent-1.jpg',
      title: 'Senior Agent',
      bio: 'With over 10 years of experience in real estate, John specializes in luxury properties and commercial real estate.',
      licenseNumber: 'AG12345678',
      agency: 'RealEstatePro Agency',
      specializations: ['Luxury Homes', 'Commercial Properties'],
      areas: ['District 1', 'District 2'],
      languages: ['English', 'Spanish'],
      averageRating: 4.8,
      reviewCount: 45,
      socialMedia: {
        facebook: 'https://facebook.com/johnsmith',
        twitter: 'https://twitter.com/johnsmith',
        linkedin: 'https://linkedin.com/in/johnsmith'
      },
      availableHours: 'Mon-Fri: 9AM-5PM'
    },
    {
      id: 'a2',
      name: 'Sarah Johnson',
      email: 'sarah@realestatepro.com',
      phone: '(512) 555-5678',
      photo: '/assets/images/agent-2.jpg',
      title: 'Property Specialist',
      bio: 'Sarah has been helping families find their dream homes for 5 years, with expertise in residential properties.',
      licenseNumber: 'AG87654321',
      agency: 'RealEstatePro Agency',
      specializations: ['Residential', 'First-time Buyers'],
      areas: ['District 3', 'District 4'],
      languages: ['English', 'French'],
      averageRating: 4.6,
      reviewCount: 32,
      socialMedia: {
        facebook: 'https://facebook.com/sarahjohnson',
        instagram: 'https://instagram.com/sarahjohnson'
      },
      availableHours: 'Mon-Sat: 10AM-6PM'
    },
    {
      id: 'a3',
      name: 'Michael Chen',
      email: 'michael@realestatepro.com',
      phone: '(512) 555-9012',
      photo: '/assets/images/agent-3.jpg',
      title: 'Investment Advisor',
      bio: 'Michael specializes in investment properties and helping clients build real estate portfolios.',
      licenseNumber: 'AG23456789',
      agency: 'RealEstatePro Agency',
      specializations: ['Investment Properties', 'Real Estate Development'],
      areas: ['District 5', 'District 7'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      averageRating: 4.9,
      reviewCount: 28,
      socialMedia: {
        linkedin: 'https://linkedin.com/in/michaelchen',
        twitter: 'https://twitter.com/michaelchen'
      },
      availableHours: 'By appointment'
    }
  ];

  // Mock data for agent applications
  private mockAgentApplications: AgentApplication[] = [
    {
      id: 1,
      email: 'agent1@example.com',
      fullName: 'Nguyễn Văn A',
      phoneNumber: '0901234567',
      agencyName: 'VietReal Estate',
      applicationDate: '2025-04-10T10:30:00',
      status: 'pending',
      documents: ['id_verification.pdf', 'license_copy.pdf'],
      notes: ''
    },
    {
      id: 2,
      email: 'agent2@example.com',
      fullName: 'Trần Thị B',
      phoneNumber: '0912345678',
      agencyName: 'SaigonHomes',
      applicationDate: '2025-04-12T14:15:00',
      status: 'pending',
      documents: ['id_verification.pdf', 'license_copy.pdf', 'profile_photo.jpg'],
      notes: ''
    },
    {
      id: 3,
      email: 'agent3@example.com',
      fullName: 'Lê Văn C',
      phoneNumber: '0923456789',
      agencyName: null,
      applicationDate: '2025-04-15T09:45:00',
      status: 'pending',
      documents: ['id_verification.pdf', 'license_copy.pdf'],
      notes: 'Freelance agent, no agency affiliation'
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all agents
  getAllAgents(): Observable<Agent[]> {
    // In a real app: return this.http.get<Agent[]>(this.apiUrl);
    return of(this.mockAgents);
  }

  // Get agent by ID
  getAgentById(id: string): Observable<Agent | undefined> {
    // In a real app: return this.http.get<Agent>(`${this.apiUrl}/${id}`);
    const agent = this.mockAgents.find(agent => agent.id === id);
    return of(agent);
  }

  // Get agents by specialization
  getAgentsBySpecialization(specialization: string): Observable<Agent[]> {
    // In a real app: return this.http.get<Agent[]>(`${this.apiUrl}/specialization/${specialization}`);
    const agents = this.mockAgents.filter(agent => 
      agent.specializations && agent.specializations.includes(specialization)
    );
    return of(agents);
  }

  // Get top-rated agents
  getTopRatedAgents(limit: number = 3): Observable<Agent[]> {
    // In a real app: return this.http.get<Agent[]>(`${this.apiUrl}/top-rated?limit=${limit}`);
    const sortedAgents = [...this.mockAgents].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    return of(sortedAgents.slice(0, limit));
  }

  // Create a new agent (for admin use)
  createAgent(agent: Omit<Agent, 'id'>): Observable<Agent> {
    // In a real app: return this.http.post<Agent>(this.apiUrl, agent);
    const newAgent: Agent = {
      ...agent,
      id: `a${this.mockAgents.length + 1}`, // Generate a fake ID
      averageRating: 0,
      reviewCount: 0
    };
    this.mockAgents.push(newAgent);
    return of(newAgent);
  }

  // Update an agent (for admin use)
  updateAgent(id: string, agent: Partial<Agent>): Observable<Agent | undefined> {
    // In a real app: return this.http.put<Agent>(`${this.apiUrl}/${id}`, agent);
    const index = this.mockAgents.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAgents[index] = { ...this.mockAgents[index], ...agent };
      return of(this.mockAgents[index]);
    }
    return of(undefined);
  }

  // Delete an agent (for admin use)
  deleteAgent(id: string): Observable<boolean> {
    // In a real app: return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    const index = this.mockAgents.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAgents.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Get list of pending agent applications
  getPendingAgentApplications(): Observable<AgentApplication[]> {
    // In a real app, replace with actual API call:
    // return this.http.get<AgentApplication[]>(`${this.apiUrl}/applications/pending`);
    return of(this.mockAgentApplications.filter(app => app.status === 'pending'))
      .pipe(delay(800)); // Simulate network delay
  }

  // Get all agent applications
  getAllAgentApplications(): Observable<AgentApplication[]> {
    // In a real app, replace with actual API call:
    // return this.http.get<AgentApplication[]>(`${this.apiUrl}/applications`);
    return of(this.mockAgentApplications).pipe(delay(800));
  }

  // Get agent application by ID
  getAgentApplication(id: number): Observable<AgentApplication> {
    // In a real app, replace with actual API call:
    // return this.http.get<AgentApplication>(`${this.apiUrl}/applications/${id}`);
    const application = this.mockAgentApplications.find(app => app.id === id);
    if (!application) {
      throw new Error('Application not found');
    }
    return of(application).pipe(delay(300));
  }

  // Approve agent application
  approveAgentApplication(id: number, notes?: string): Observable<AgentApplication> {
    // In a real app, replace with actual API call:
    // return this.http.patch<AgentApplication>(
    //   `${this.apiUrl}/applications/${id}/approve`, 
    //   { notes }
    // );
    
    const index = this.mockAgentApplications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error('Application not found');
    }
    
    this.mockAgentApplications[index] = {
      ...this.mockAgentApplications[index],
      status: 'approved',
      notes: notes || this.mockAgentApplications[index].notes
    };
    
    return of(this.mockAgentApplications[index]).pipe(delay(800));
  }

  // Reject agent application
  rejectAgentApplication(id: number, notes: string): Observable<AgentApplication> {
    // In a real app, replace with actual API call:
    // return this.http.patch<AgentApplication>(
    //   `${this.apiUrl}/applications/${id}/reject`,
    //   { notes }
    // );
    
    const index = this.mockAgentApplications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error('Application not found');
    }
    
    this.mockAgentApplications[index] = {
      ...this.mockAgentApplications[index],
      status: 'rejected',
      notes: notes
    };
    
    return of(this.mockAgentApplications[index]).pipe(delay(800));
  }
}