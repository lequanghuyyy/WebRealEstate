import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

// Custom pipe for filtering contact requests
@Pipe({
  name: 'filterContacts',
  standalone: true
})
export class FilterContactsPipe implements PipeTransform {
  transform(contacts: any[], filter: string): any[] {
    if (!contacts || !filter || filter === 'all') {
      return contacts;
    }
    return contacts.filter(contact => contact.status === filter);
  }
}

// Custom pipe for filtering viewing schedules
@Pipe({
  name: 'filterViewings',
  standalone: true
})
export class FilterViewingsPipe implements PipeTransform {
  transform(viewings: any[], filter: string): any[] {
    if (!viewings || !filter || filter === 'all') {
      return viewings;
    }
    return viewings.filter(viewing => viewing.status === filter);
  }
}

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FilterContactsPipe, FilterViewingsPipe]
})
export class AgentDashboardComponent implements OnInit {
  agent: any = null;
  isLoading = true;
  activeTab = 'overview';
  
  // Các trạng thái trang
  isNewListingPage = false;
  isEditListingPage = false;
  editingListingId: number | null = null;
  
  // Filter states
  activeContactFilter: string = 'all';
  activeViewingFilter: string = 'all';
  
  // Selected items for modals
  selectedContactRequest: any = null;
  selectedViewing: any = null;
  
  listings = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      status: 'Active',
      price: 250000,
      type: 'Sale',
      views: 120,
      favorites: 15,
      inquiries: 8,
      dateCreated: '2023-03-15',
      thumbnail: '/assets/images/properties/property-1.jpg'
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool',
      status: 'Active',
      price: 1250000,
      type: 'Sale',
      views: 340,
      favorites: 42,
      inquiries: 16,
      dateCreated: '2023-02-10',
      thumbnail: '/assets/images/properties/property-2.jpg'
    },
    {
      id: 3,
      title: 'Office Space in Business District',
      status: 'Pending',
      price: 5000,
      type: 'Rent',
      views: 78,
      favorites: 6,
      inquiries: 4,
      dateCreated: '2023-04-05',
      thumbnail: '/assets/images/properties/property-3.jpg'
    }
  ];
  
  // Mock data for recent activities
  activities = [
    { type: 'message', content: 'New message from John Smith about Modern Apartment', time: '10 minutes ago' },
    { type: 'view', content: 'Your listing "Luxury Villa with Pool" was viewed by 25 people', time: '2 hours ago' },
    { type: 'favorite', content: '5 users added "Office Space" to their favorites', time: '5 hours ago' },
    { type: 'inquiry', content: 'New inquiry about "Modern Apartment" from Sarah Johnson', time: '1 day ago' },
    { type: 'listing', content: 'Your listing "Luxury Villa with Pool" was approved', time: '2 days ago' }
  ];
  
  // Mock data for messages
  messages = [
    { 
      id: 1, 
      from: 'John Smith',
      email: 'john@example.com',
      phone: '123-456-7890',
      subject: 'Inquiry about Modern Apartment',
      message: 'I am interested in this property. Is it still available? When can I schedule a viewing?',
      date: '2023-04-14',
      read: false,
      propertyId: 1
    },
    { 
      id: 2, 
      from: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '456-789-0123',
      subject: 'Question about Luxury Villa',
      message: 'Does this property come with furnished rooms? Also, is there a garage available?',
      date: '2023-04-12',
      read: true,
      propertyId: 2
    },
    { 
      id: 3, 
      from: 'Michael Brown',
      email: 'michael@example.com',
      phone: '789-012-3456',
      subject: 'Office Space Inquiry',
      message: 'I represent a small company looking for office space. We are interested in your listing. Would you be open to a 3-year lease agreement?',
      date: '2023-04-10',
      read: true,
      propertyId: 3
    }
  ];
  
  // Mock data for contact requests
  contactRequests = [
    {
      id: 1,
      name: 'Emily Wilson',
      email: 'emily@example.com',
      phone: '123-456-7890',
      message: 'Hi, I\'m interested in the Modern Apartment. I would like to know if there are any discounts for long-term leases.',
      property: {
        id: 1,
        title: 'Modern Apartment in Downtown',
        thumbnail: '/assets/images/properties/property-1.jpg'
      },
      date: '2023-05-15',
      status: 'new',
      notes: ''
    },
    {
      id: 2,
      name: 'David Lee',
      email: 'david@example.com',
      phone: '234-567-8901',
      message: 'Hello, I have some questions about the Luxury Villa with Pool. Could you provide more details about the neighborhood?',
      property: {
        id: 2,
        title: 'Luxury Villa with Pool',
        thumbnail: '/assets/images/properties/property-2.jpg'
      },
      date: '2023-05-14',
      status: 'inprogress',
      notes: 'Called back on May 15, customer has more questions about schools in the area'
    },
    {
      id: 3,
      name: 'Lisa Johnson',
      email: 'lisa@example.com',
      phone: '345-678-9012',
      message: 'I would like to get more information about the Office Space. Our company is looking to move in the next 3 months.',
      property: {
        id: 3,
        title: 'Office Space in Business District',
        thumbnail: '/assets/images/properties/property-3.jpg'
      },
      date: '2023-05-12',
      status: 'closed',
      notes: 'Scheduled a meeting for May 20 to discuss details'
    }
  ];
  
  // Mock data for viewing schedules
  viewingSchedules = [
    {
      id: 1,
      name: 'Ryan Thompson',
      email: 'ryan@example.com',
      phone: '456-789-0123',
      date: '2023-05-18',
      time: '14:00',
      property: {
        id: 1,
        title: 'Modern Apartment in Downtown',
        thumbnail: '/assets/images/properties/property-1.jpg',
        address: '123 Main Street, Downtown'
      },
      status: 'pending',
      notes: '',
      additionalNotes: 'Looking for a property that allows pets'
    },
    {
      id: 2,
      name: 'Jennifer Adams',
      email: 'jennifer@example.com',
      phone: '567-890-1234',
      date: '2023-05-19',
      time: '10:30',
      property: {
        id: 2,
        title: 'Luxury Villa with Pool',
        thumbnail: '/assets/images/properties/property-2.jpg',
        address: '456 Palm Avenue, Luxury Estates'
      },
      status: 'confirmed',
      notes: 'Confirmed via email',
      additionalNotes: 'Has pre-approval for mortgage'
    },
    {
      id: 3,
      name: 'Alex Chen',
      email: 'alex@example.com',
      phone: '678-901-2345',
      date: '2023-05-17',
      time: '16:00',
      property: {
        id: 3,
        title: 'Office Space in Business District',
        thumbnail: '/assets/images/properties/property-3.jpg',
        address: '789 Business Road, Suite 300'
      },
      status: 'completed',
      notes: 'Client was interested, will follow up next week',
      additionalNotes: 'Represents a tech company with 15 employees'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Xác định loại trang hiện tại
    const currentUrl = this.router.url;
    this.isNewListingPage = currentUrl.includes('/listings/new');
    this.isEditListingPage = currentUrl.includes('/listings/edit');
    
    // Nếu đang ở trang chỉnh sửa, lấy ID từ URL
    if (this.isEditListingPage) {
      const urlSegments = currentUrl.split('/');
      const idStr = urlSegments[urlSegments.length - 1];
      this.editingListingId = parseInt(idStr, 10);
    }
    
    // Check if user is an agent
    if (!this.authService.isAgent()) {
      this.router.navigate(['/']);
      return;
    }
    
    // Get agent data
    this.agent = this.authService.getCurrentUser();
    this.isLoading = false;
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  // Methods for agent actions
  addNewListing() {
    this.router.navigate(['/agent/create-listing']);
  }
  
  editListing(id: number): void {
    // Chuyển hướng đến trang edit-listing với ID của listing cần chỉnh sửa
    this.router.navigate(['/agent/edit-listing', id]);
  }
  
  deleteListing(listingId: number) {
    console.log('Delete listing with ID:', listingId);
    // In a real application, confirm and then delete listing
    const confirmDelete = confirm('Are you sure you want to delete this listing?');
    if (confirmDelete) {
      // API call to delete listing
      this.listings = this.listings.filter(listing => listing.id !== listingId);
    }
  }
  
  markMessageAsRead(messageId: number) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
    }
  }
  
  replyToMessage(messageId: number) {
    console.log('Reply to message with ID:', messageId);
    // In a real application, open a reply form or navigate to messaging interface
  }
  
  getUnreadMessageCount(): number {
    return this.messages.filter(m => !m.read).length;
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  
  getActiveListingsCount(): number {
    return this.listings ? this.listings.filter(listing => listing.status === 'Active').length : 0;
  }
  
  getListingProperty(listingId: number | null, property: string): any {
    if (!listingId) return '';
    
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) return '';
    
    return listing[property as keyof typeof listing] || '';
  }
  
  // Contact Request Methods
  updateContactRequestStatus(requestId: number, status: string) {
    const request = this.contactRequests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
    }
  }
  
  saveContactRequestNotes(requestId: number, notes: string) {
    const request = this.contactRequests.find(r => r.id === requestId);
    if (request) {
      request.notes = notes;
    }
  }
  
  showContactRequestDetails(requestId: number) {
    this.selectedContactRequest = this.contactRequests.find(r => r.id === requestId);
    // Open modal using Bootstrap
    const modal = document.getElementById('contactRequestModal');
    if (modal) {
      // Use window.bootstrap to access the Bootstrap API
      // @ts-ignore
      const bsModal = new window.bootstrap.Modal(modal);
      bsModal.show();
    }
  }
  
  saveContactRequestChanges() {
    if (this.selectedContactRequest) {
      const index = this.contactRequests.findIndex(r => r.id === this.selectedContactRequest.id);
      if (index !== -1) {
        this.contactRequests[index] = {...this.selectedContactRequest};
      }
      
      // Close modal
      const modal = document.getElementById('contactRequestModal');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      }
    }
  }
  
  scheduleViewing(contactRequest: any) {
    // Create a new viewing schedule from the contact request
    const newViewing = {
      id: this.viewingSchedules.length + 1,
      name: contactRequest.name,
      email: contactRequest.email,
      phone: contactRequest.phone,
      date: new Date().toISOString().split('T')[0], // Today
      time: '10:00', // Default time
      property: contactRequest.property,
      status: 'pending',
      notes: '',
      additionalNotes: contactRequest.message
    };
    
    this.viewingSchedules.push(newViewing);
    this.selectedViewing = newViewing;
    
    // Close current modal
    const contactModal = document.getElementById('contactRequestModal');
    if (contactModal) {
      // @ts-ignore
      const bsModal = window.bootstrap.Modal.getInstance(contactModal);
      if (bsModal) {
        bsModal.hide();
      }
    }
    
    // Open viewing modal
    setTimeout(() => {
      const viewingModal = document.getElementById('viewingScheduleModal');
      if (viewingModal) {
        // @ts-ignore
        const bsModal = new window.bootstrap.Modal(viewingModal);
        bsModal.show();
      }
    }, 500);
  }
  
  // Viewing Schedule Methods
  updateViewingStatus(viewingId: number, status: string) {
    const viewing = this.viewingSchedules.find(v => v.id === viewingId);
    if (viewing) {
      viewing.status = status;
    }
  }
  
  saveViewingNotes(viewingId: number, notes: string) {
    const viewing = this.viewingSchedules.find(v => v.id === viewingId);
    if (viewing) {
      viewing.notes = notes;
    }
  }
  
  showViewingDetails(viewingId: number) {
    this.selectedViewing = this.viewingSchedules.find(v => v.id === viewingId);
    // Open modal using Bootstrap
    const modal = document.getElementById('viewingScheduleModal');
    if (modal) {
      // @ts-ignore
      const bsModal = new window.bootstrap.Modal(modal);
      bsModal.show();
    }
  }
  
  saveViewingChanges() {
    if (this.selectedViewing) {
      const index = this.viewingSchedules.findIndex(v => v.id === this.selectedViewing.id);
      if (index !== -1) {
        this.viewingSchedules[index] = {...this.selectedViewing};
      }
      
      // Close modal
      const modal = document.getElementById('viewingScheduleModal');
      if (modal) {
        // @ts-ignore
        const bsModal = window.bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      }
    }
  }
  
  sendViewingConfirmation(viewingId: number) {
    const viewing = this.viewingSchedules.find(v => v.id === viewingId);
    if (viewing) {
      viewing.status = 'confirmed';
      // In a real app, would send an email or notification to the client
      alert(`Confirmation sent to ${viewing.name} for viewing on ${this.formatDate(viewing.date)} at ${this.formatTime(viewing.time)}`);
    }
  }
  
  getUpcomingViewingsCount(): number {
    return this.viewingSchedules.filter(v => v.status === 'confirmed' || v.status === 'pending').length;
  }
  
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  formatTime(timeStr: string): string {
    // Convert 24-hour format to 12-hour format
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  // Thêm phương thức mới để chuyển đến trang tạo listing mới
  routeToNewListing(): void {
    this.router.navigate(['/agent/create-listing']);
  }
} 