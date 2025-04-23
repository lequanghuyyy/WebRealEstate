import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Agent } from '../../../models/agent.model';
import { AgentService } from '../../../services/agent.service';

@Component({
  selector: 'app-admin-agents',
  templateUrl: './admin-agents.component.html',
  styleUrls: ['./admin-agents.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AdminAgentsComponent implements OnInit {
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  selectedSpecialization = '';
  
  // Agent form for adding/editing
  agentForm: FormGroup;
  isEditing = false;
  currentAgentId = '';
  formSubmitted = false;
  formError = '';
  formSuccess = '';
  
  // For modal
  showModal = false;
  modalTitle = '';
  confirmationMessage = '';
  agentToDelete: Agent | null = null;

  constructor(
    private agentService: AgentService,
    private fb: FormBuilder
  ) {
    this.agentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
      photo: [''],
      title: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(10)]],
      licenseNumber: ['', Validators.required],
      agency: ['', Validators.required],
      specializations: ['', Validators.required],
      areas: ['', Validators.required],
      languages: ['', Validators.required],
      availableHours: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.agentService.getAllAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
        this.filteredAgents = [...agents];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load agents. Please try again later.';
        console.error('Error loading agents:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAgents = this.agents.filter(agent => {
      // Filter by search query
      const matchesSearch = this.searchQuery.trim() === '' || 
        agent.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agent.licenseNumber.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Filter by specialization
      const matchesSpecialization = this.selectedSpecialization === '' || 
        agent.specializations.includes(this.selectedSpecialization);
      
      return matchesSearch && matchesSpecialization;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedSpecialization = '';
    this.filteredAgents = [...this.agents];
  }

  openAddAgentForm(): void {
    this.agentForm.reset();
    this.isEditing = false;
    this.formSubmitted = false;
    this.formError = '';
    this.formSuccess = '';
    this.modalTitle = 'Add New Agent';
    this.showModal = true;
  }

  openEditAgentForm(agent: Agent): void {
    this.isEditing = true;
    this.currentAgentId = agent.id;
    this.formSubmitted = false;
    this.formError = '';
    this.formSuccess = '';
    this.modalTitle = 'Edit Agent';
    
    // Convert arrays to comma-separated strings for the form
    this.agentForm.patchValue({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      photo: agent.photo,
      title: agent.title,
      bio: agent.bio,
      licenseNumber: agent.licenseNumber,
      agency: agent.agency,
      specializations: agent.specializations.join(', '),
      areas: agent.areas.join(', '),
      languages: agent.languages.join(', '),
      availableHours: agent.availableHours
    });
    
    this.showModal = true;
  }

  openDeleteConfirmation(agent: Agent): void {
    this.agentToDelete = agent;
    this.confirmationMessage = `Are you sure you want to delete agent ${agent.name}?`;
    this.showModal = true;
  }
  
  confirmDelete(): void {
    if (this.agentToDelete) {
      this.agentService.deleteAgent(this.agentToDelete.id).subscribe({
        next: (success) => {
          if (success) {
            this.agents = this.agents.filter(a => a.id !== this.agentToDelete!.id);
            this.filteredAgents = this.filteredAgents.filter(a => a.id !== this.agentToDelete!.id);
            this.formSuccess = 'Agent deleted successfully';
            setTimeout(() => {
              this.closeModal();
              this.formSuccess = '';
            }, 2000);
          } else {
            this.formError = 'Failed to delete agent';
          }
        },
        error: (error) => {
          this.formError = 'Error deleting agent';
          console.error('Error:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.agentToDelete = null;
  }

  submitAgentForm(): void {
    this.formSubmitted = true;
    this.formError = '';
    this.formSuccess = '';
    
    if (this.agentForm.invalid) {
      this.formError = 'Please fill all required fields correctly';
      return;
    }
    
    const formData = this.agentForm.value;
    
    // Convert comma-separated strings to arrays
    const agentData = {
      ...formData,
      specializations: formData.specializations.split(',').map((s: string) => s.trim()),
      areas: formData.areas.split(',').map((a: string) => a.trim()),
      languages: formData.languages.split(',').map((l: string) => l.trim())
    };
    
    if (this.isEditing) {
      // Update existing agent
      this.agentService.updateAgent(this.currentAgentId, agentData).subscribe({
        next: (updatedAgent) => {
          if (updatedAgent) {
            const index = this.agents.findIndex(a => a.id === this.currentAgentId);
            if (index !== -1) {
              this.agents[index] = updatedAgent;
              this.applyFilters(); // Refresh filtered list
              this.formSuccess = 'Agent updated successfully';
              setTimeout(() => {
                this.closeModal();
                this.formSuccess = '';
              }, 2000);
            }
          } else {
            this.formError = 'Failed to update agent';
          }
        },
        error: (error) => {
          this.formError = 'Error updating agent';
          console.error('Error:', error);
        }
      });
    } else {
      // Add new agent
      this.agentService.createAgent(agentData).subscribe({
        next: (newAgent) => {
          this.agents.push(newAgent);
          this.applyFilters(); // Refresh filtered list
          this.formSuccess = 'Agent added successfully';
          setTimeout(() => {
            this.closeModal();
            this.formSuccess = '';
          }, 2000);
        },
        error: (error) => {
          this.formError = 'Error adding agent';
          console.error('Error:', error);
        }
      });
    }
  }

  // Helper functions for the template
  getSpecializationsList(): string[] {
    // Get unique specializations from all agents
    const specializations = new Set<string>();
    this.agents.forEach(agent => {
      agent.specializations.forEach(spec => specializations.add(spec));
    });
    return Array.from(specializations).sort();
  }
} 