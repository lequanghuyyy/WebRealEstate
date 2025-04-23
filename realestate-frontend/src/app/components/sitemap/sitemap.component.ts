import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SitemapCategory {
  title: string;
  links: { label: string; url: string }[];
}

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SitemapComponent implements OnInit {
  sitemapCategories: SitemapCategory[] = [
    {
      title: 'Main Pages',
      links: [
        { label: 'Home', url: '/' },
        { label: 'About Us', url: '/about' },
        { label: 'Contact Us', url: '/contact' },
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Privacy Policy', url: '/privacy' }
      ]
    },
    {
      title: 'Property Pages',
      links: [
        { label: 'All Properties', url: '/properties' },
        { label: 'Buy Properties', url: '/buy' },
        { label: 'Rent Properties', url: '/rent' }
      ]
    },
    {
      title: 'User Account',
      links: [
        { label: 'Login', url: '/login' },
        { label: 'Register', url: '/register' },
        { label: 'Forgot Password', url: '/forgot-password' },
        { label: 'My Profile', url: '/profile' },
        { label: 'My Favorites', url: '/profile/favorites' },
        { label: 'Saved Searches', url: '/profile/saved-searches' }
      ]
    },
    {
      title: 'Property Types',
      links: [
        { label: 'Apartments', url: '/listings/apartment' },
        { label: 'Houses', url: '/listings/house' },
        { label: 'Commercial', url: '/listings/commercial' },
        { label: 'Villas', url: '/listings/villa' },
        { label: 'Land', url: '/listings/land' }
      ]
    },
    {
      title: 'Services',
      links: [
        { label: 'Buying', url: '/services/buying' },
        { label: 'Selling', url: '/services/selling' },
        { label: 'Renting', url: '/services/renting' },
        { label: 'Mortgage', url: '/services/mortgage' },
        { label: 'Property Valuation', url: '/services/valuation' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
} 