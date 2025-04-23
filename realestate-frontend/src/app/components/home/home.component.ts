import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchType: string = 'buy';
  isLoggedIn: boolean = false;
  user: any = null;
  
  // Featured properties data
  featuredProperties = [
    {
      id: 1,
      image: '/assets/images/property-1.jpg',
      price: '$450,000',
      address: '123 Main Street, City',
      beds: 3,
      baths: 2,
      area: '1,800 sqft',
      description: 'Beautiful modern home with excellent amenities and convenient location.',
      tag: 'Featured'
    },
    {
      id: 2,
      image: '/assets/images/property-2.jpg',
      price: '$325,000',
      address: '456 Oak Avenue, Town',
      beds: 2,
      baths: 2,
      area: '1,200 sqft',
      description: 'Charming townhouse with updated finishes in a desirable neighborhood.',
      tag: 'New'
    },
    {
      id: 3,
      image: '/assets/images/property-3.jpg',
      price: '$580,000',
      address: '789 Pine Road, Village',
      beds: 4,
      baths: 3,
      area: '2,500 sqft',
      description: 'Spacious family home with large backyard and modern amenities.',
      tag: 'Sale'
    }
  ];
  
  // Recommended properties for logged-in users
  recommendedProperties = [
    {
      id: 4,
      image: '/assets/images/property-4.jpg',
      price: '$420,000',
      address: '101 Maple Drive, Suburbia',
      beds: 3,
      baths: 2,
      area: '1,950 sqft',
      description: 'Beautiful renovated home with modern kitchen and great school district.',
      tag: 'Recommended'
    },
    {
      id: 5,
      image: '/assets/images/property-5.jpg',
      price: '$515,000',
      address: '202 Cedar Lane, Metro',
      beds: 3,
      baths: 2.5,
      area: '2,100 sqft',
      description: 'Stunning contemporary home with open floor plan and premium finishes.',
      tag: 'Hot'
    }
  ];
  
  constructor(private authService: AuthService, private router: Router) { }
  
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.user = this.authService.getCurrentUser();
    }
  }
  
  viewPropertyDetails(propertyId: number): void {
    this.router.navigate(['/properties', propertyId]);
  }
  
  saveSearch(): void {
    if (this.isLoggedIn) {
      console.log('Saving search criteria...');
      // In a real app, call a service to save the search
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: 'save-search' } });
    }
  }
}