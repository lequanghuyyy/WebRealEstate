import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface TermsCategory {
  title: string;
  content: string[];
}

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TermsComponent implements OnInit {
  lastUpdated: string = 'February 15, 2023';
  
  termsCategories: TermsCategory[] = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing or using RealEstatePro, you agree to comply with and be bound by these Terms of Use.',
        'If you do not agree to these terms, please do not use our platform.',
        'We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting.'
      ]
    },
    {
      title: 'User Accounts',
      content: [
        'You may need to create an account to access certain features of our platform.',
        'You are responsible for maintaining the confidentiality of your account information.',
        'You agree to provide accurate and complete information when creating an account.',
        'You are solely responsible for all activities that occur under your account.'
      ]
    },
    {
      title: 'Property Listings',
      content: [
        'We strive to provide accurate property information, but we do not guarantee the accuracy of listings.',
        'Property information is provided by sellers and agents and should be independently verified.',
        'Images and descriptions are meant to be representative only.',
        'Prices and availability are subject to change without notice.'
      ]
    },
    {
      title: 'Intellectual Property',
      content: [
        'All content on RealEstatePro is the property of our company or our content suppliers.',
        'You may not reproduce, distribute, modify, or create derivative works from any content without explicit permission.',
        'Our name, logo, and other trademarks may not be used without our prior written consent.'
      ]
    },
    {
      title: 'Privacy Policy',
      content: [
        'Your use of RealEstatePro is also governed by our Privacy Policy.',
        'By using our platform, you consent to the collection and use of information as detailed in our Privacy Policy.',
        'We are committed to protecting your personal information and using it only for purposes disclosed to you.'
      ]
    },
    {
      title: 'Limitation of Liability',
      content: [
        'RealEstatePro is provided on an "as is" and "as available" basis without any representations or warranties.',
        'We are not liable for any damages arising from your use of our platform.',
        'We do not guarantee uninterrupted or error-free service.'
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
    window.scrollTo(0, 0); // Scroll to top when component loads
  }
} 