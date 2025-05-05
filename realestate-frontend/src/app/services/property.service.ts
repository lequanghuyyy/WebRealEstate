import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Property } from '../models/property.model';
import { PropertyApiService } from './property-api.service';
import { map } from 'rxjs/operators';
import { ListingResponse, ListingRequest, ListingType, ListingPropertyType } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  
  constructor(private propertyApiService: PropertyApiService) { }

  // Method to get properties from API service
  getProperties(): Observable<Property[]> {
    // Use the API service to get listings
    return this.propertyApiService.getListingsBySaleType().pipe(
      map(listings => this.convertListingsToProperties(listings))
    );
  }
  
  // Alias for getProperties for backward compatibility
  getAllProperties(): Observable<Property[]> {
    return this.getProperties();
  }

  // Method to get a property by ID
  getPropertyById(id: string): Observable<Property> {
    return this.propertyApiService.getListingById(id).pipe(
      map(listing => this.convertListingToProperty(listing))
    );
  }
  
  // Get similar properties for property details page
  getSimilarProperties(propertyId: string | number, propertyType: string, limit: number = 4): Observable<Property[]> {
    // We'll simulate this by getting properties and filtering them
    return this.getProperties().pipe(
      map(properties => {
        // Filter out the current property and find similar ones
        return properties
          .filter(p => p.id !== propertyId && p.type === propertyType)
          .slice(0, limit);
      })
    );
  }
  
  // Submit contact request for property
  submitContactRequest(formData: any): Observable<{success: boolean, message: string}> {
    // Simulate contact request submission
    console.log('Contact request submitted:', formData);
    return of({
      success: true,
      message: 'Your message has been sent. We will contact you shortly.'
    });
  }
  
  // Create a new property
  createProperty(property: any): Observable<Property> {
    // Convert Property to ListingRequest
    const listingRequest: ListingRequest = {
      title: property.title,
      description: property.description,
      address: property.location.address,
      city: property.location.city,
      image: property.images && property.images.length > 0 ? property.images[0] : '',
      price: property.price,
      area: property.features.area,
      bedrooms: property.features.bedrooms,
      bathrooms: property.features.bathrooms,
      type: property.type === 'buy' ? ListingType.SALE : ListingType.RENT,
      propertyType: this.mapToPropertyType(property.type),
      ownerId: property.agent.id
    };
    
    return this.propertyApiService.createListing(listingRequest).pipe(
      map(listing => this.convertListingToProperty(listing))
    );
  }
  
  // Update an existing property
  updateProperty(id: string, property: any): Observable<Property> {
    // Convert Property to ListingRequest
    const listingRequest: ListingRequest = {
      title: property.title,
      description: property.description,
      address: property.location.address,
      city: property.location.city,
      image: property.images && property.images.length > 0 ? property.images[0] : '',
      price: property.price,
      area: property.features.area,
      bedrooms: property.features.bedrooms,
      bathrooms: property.features.bathrooms,
      type: property.type === 'buy' ? ListingType.SALE : ListingType.RENT,
      propertyType: this.mapToPropertyType(property.type),
      ownerId: property.agent.id
    };
    
    return this.propertyApiService.updateListing(id, listingRequest).pipe(
      map(listing => this.convertListingToProperty(listing))
    );
  }
  
  // Helper method to map property type string to ListingPropertyType enum
  private mapToPropertyType(type: string): ListingPropertyType {
    switch (type.toLowerCase()) {
      case 'house':
        return ListingPropertyType.House;
      case 'apartment':
        return ListingPropertyType.Apartment;
      case 'villa':
        return ListingPropertyType.Villa;
      default:
        return ListingPropertyType.House; // Default to House
    }
  }

  // Helper method to convert ListingResponse to Property model
  private convertListingToProperty(listing: ListingResponse): Property {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type === ListingType.SALE ? 'buy' : 'rent',
      status: listing.status,
      location: {
        address: listing.address,
        city: listing.city,
        state: 'N/A',
        zipCode: 'N/A',
        country: 'Vietnam'
      },
      features: {
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        area: listing.area,
        yearBuilt: new Date().getFullYear() - 5 // Placeholder
      },
      amenities: [],
      images: [listing.image || 'assets/images/property-placeholder.jpg'],
      agent: {
        id: listing.ownerId,
        name: 'Agent',
        email: 'agent@example.com',
        phone: '123-456-7890',
        photo: 'assets/images/agent-placeholder.jpg'
      },
      tags: [listing.propertyType],
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      views: listing.view
    };
  }

  // Helper method to convert array of ListingResponse to Property[]
  private convertListingsToProperties(listings: ListingResponse[]): Property[] {
    return listings.map(listing => this.convertListingToProperty(listing));
  }
} 