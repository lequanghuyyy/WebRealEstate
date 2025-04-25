import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserAppointmentsComponent } from './appointments/user-appointments.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, UserAppointmentsComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditing = false;
  profileForm = {
    name: '',
    email: '',
    phone: '',
    bio: ''
  };
  
  // Properties for favorites and saved searches
  favoriteProperties: any[] = [];
  savedSearches: any[] = [];
  recentlyViewed: any[] = [];
  
  // Property for active tab
  activeTab = 'profile';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.profileForm.name = this.user.name || '';
      this.profileForm.email = this.user.email || '';
      this.profileForm.phone = this.user.phone || '';
      this.profileForm.bio = this.user.bio || '';
      
      // In a real app, these would be fetched from a service
      this.loadMockData();
      
      // Đặt tab hoạt động dựa trên URL hiện tại
      this.setActiveTabFromUrl();
    }
  }
  
  // Phương thức đặt tab hoạt động dựa trên URL
  private setActiveTabFromUrl(): void {
    const urlPath = this.router.url;
    
    if (urlPath.includes('/profile/favorites')) {
      this.activeTab = 'favorites';
    } else if (urlPath.includes('/profile/saved-searches')) {
      this.activeTab = 'saved-searches';
    } else if (urlPath.includes('/profile/appointments')) {
      this.activeTab = 'appointments';
    } else if (urlPath.includes('/profile/recent')) {
      this.activeTab = 'recent';
    } else {
      this.activeTab = 'profile';
    }
  }
  
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }
  
  saveProfile(): void {
    // In a real app, this would call a service to update the user profile
    console.log('Saving profile:', this.profileForm);
    
    // Update the local user object
    this.user = {
      ...this.user,
      name: this.profileForm.name,
      email: this.profileForm.email,
      phone: this.profileForm.phone,
      bio: this.profileForm.bio
    };
    
    this.isEditing = false;
    
    // In a real app: this.userService.updateProfile(this.profileForm).subscribe(...)
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Cập nhật URL khi chuyển tab
    if (tab === 'profile') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profile', tab]);
    }
  }
  
  // Simulate loading user data
  private loadMockData(): void {
    // Mock favorite properties
    this.favoriteProperties = [
      {
        id: 1,
        title: 'Modern Apartment in Downtown',
        image: '/assets/images/property-1.jpg',
        price: '$450,000',
        location: '123 Main St, City',
        beds: 2,
        baths: 2,
        area: '1,200 sqft'
      },
      {
        id: 2,
        title: 'Suburban Family Home',
        image: '/assets/images/property-2.jpg',
        price: '$650,000',
        location: '456 Oak Ave, Suburb',
        beds: 4,
        baths: 3,
        area: '2,400 sqft'
      }
    ];
    
    // Mock saved searches
    this.savedSearches = [
      {
        id: 1,
        name: 'Downtown Apartments',
        criteria: 'Downtown area, 1-2 beds, max $500K',
        date: '2023-12-01'
      },
      {
        id: 2,
        name: 'Family Homes',
        criteria: 'Suburbs, 3+ beds, 2+ baths',
        date: '2023-11-15'
      }
    ];
    
    // Mock recently viewed
    this.recentlyViewed = [
      {
        id: 3,
        title: 'Luxury Condo with View',
        image: '/assets/images/property-3.jpg',
        price: '$750,000',
        location: '789 View St, Highrise',
        beds: 3,
        baths: 2,
        area: '1,800 sqft'
      }
    ];
  }
} 