import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <h1>Property Listings</h1>
      <p>This page will display all available property listings.</p>
    </div>
  `,
  styles: []
})
export class ListingComponent {
} 