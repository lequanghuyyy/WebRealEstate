import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PrivacyCategory {
  title: string;
  content: string[];
}

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PrivacyComponent implements OnInit {
  lastUpdated: string = 'March 10, 2023';
  
  privacyCategories: PrivacyCategory[] = [
    {
      title: 'Information We Collect',
      content: [
        'Personal information such as name, email address, phone number, and mailing address.',
        'Information about your interactions with our website, including browsing history and search queries.',
        'Information you provide when creating an account or completing forms on our platform.'
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To provide and improve our real estate services to you.',
        'To personalize your experience and deliver relevant property recommendations.',
        'To communicate with you about your account or properties you may be interested in.',
        'To comply with legal obligations and enforce our terms.'
      ]
    },
    {
      title: 'Information Sharing',
      content: [
        'We may share your information with property sellers or agents when you express interest in a property.',
        'We may share information with third-party service providers who help us operate our platform.',
        'We may disclose information if required by law or to protect our rights or the rights of others.'
      ]
    },
    {
      title: 'Cookies and Tracking Technologies',
      content: [
        'We use cookies and similar technologies to improve user experience and analyze website traffic.',
        'You can control cookies through your browser settings, but this may affect some functionality.',
        'We may use third-party analytics services that collect information about your use of our website.'
      ]
    },
    {
      title: 'Your Privacy Rights',
      content: [
        'You have the right to access, correct, or delete your personal information.',
        'You can opt out of marketing communications by following the unsubscribe instructions.',
        'You can manage cookie preferences through your browser settings.',
        'Depending on your location, you may have additional rights under applicable privacy laws.'
      ]
    },
    {
      title: 'Data Security',
      content: [
        'We implement appropriate security measures to protect your personal information.',
        'Despite our efforts, no method of transmission over the Internet is 100% secure.',
        'You are responsible for maintaining the confidentiality of your account credentials.'
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
    window.scrollTo(0, 0); // Scroll to top when component loads
  }
} 