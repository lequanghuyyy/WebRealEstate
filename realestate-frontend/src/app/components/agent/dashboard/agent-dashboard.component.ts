import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]
})
export class AgentDashboardComponent implements OnInit {
  agent: any = null;
  isLoading = true;
  activeTab = 'overview';
  
  // Các trạng thái trang
  isNewListingPage = false;
  isEditListingPage = false;
  editingListingId: number | null = null;
  
  
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
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  // Thêm phương thức mới để chuyển đến trang tạo listing mới
  routeToNewListing(): void {
    this.router.navigate(['/agent/create-listing']);
  }
} 