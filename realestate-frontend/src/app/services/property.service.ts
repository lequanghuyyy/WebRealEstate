import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Property } from '../models/property.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;
  
  // Mock properties data
  private mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern Family Home with Pool',
      description: 'Beautiful modern home with open floor plan, renovated kitchen, and large backyard with pool. Perfect for families looking for space and comfort in a quiet neighborhood.',
      price: 450000,
      type: 'House',
      status: 'for sale',
      location: {
        address: '123 Main Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      features: {
        bedrooms: 4,
        bathrooms: 3,
        area: 2200,
        yearBuilt: 2015
      },
      amenities: ['Pool', 'Garden', 'Garage', 'Air Conditioning', 'Heating', 'Security System'],
      images: [
        'https://placehold.co/600x400/3498db/ffffff?text=Modern+Family+Home',
        'https://placehold.co/600x400/2ecc71/ffffff?text=Kitchen',
        'https://placehold.co/600x400/e74c3c/ffffff?text=Backyard'
      ],
      agent: {
        id: 'a1',
        name: 'John Smith',
        email: 'john@realestatepro.com',
        phone: '(512) 555-1234',
        photo: 'https://placehold.co/200x200/2c3e50/ffffff?text=John+Smith',
        title: 'Senior Agent'
      },
      tags: ['Featured', 'New'],
      createdAt: new Date('2023-09-15'),
      updatedAt: new Date('2023-09-15')
    },
    {
      id: '2',
      title: 'Luxury Downtown Penthouse',
      description: 'Stunning penthouse in the heart of downtown with panoramic city views. High-end finishes, gourmet kitchen, and private terrace. Includes access to building amenities like pool, gym, and concierge.',
      price: 1200000,
      type: 'Apartment',
      status: 'for sale',
      location: {
        address: '456 Main Avenue, Apt 2501',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      features: {
        bedrooms: 3,
        bathrooms: 3.5,
        area: 2800,
        yearBuilt: 2019
      },
      amenities: ['Doorman', 'Elevator', 'Gym', 'Pool', 'Terrace', 'Concierge', 'Parking'],
      images: [
        'https://placehold.co/600x400/9b59b6/ffffff?text=Luxury+Penthouse',
        'https://placehold.co/600x400/f39c12/ffffff?text=Living+Area',
        'https://placehold.co/600x400/3498db/ffffff?text=Kitchen'
      ],
      agent: {
        id: 'a2',
        name: 'Sarah Johnson',
        email: 'sarah@realestatepro.com',
        phone: '(512) 555-5678',
        photo: 'https://placehold.co/200x200/e74c3c/ffffff?text=Sarah+Johnson',
        title: 'Luxury Properties Specialist'
      },
      tags: ['Luxury', 'Featured'],
      createdAt: new Date('2023-08-20'),
      updatedAt: new Date('2023-08-25')
    },
    {
      id: '3',
      title: 'Charming Suburban Cottage',
      description: 'Adorable and well-maintained cottage in a peaceful suburban neighborhood. Features original hardwood floors, updated kitchen, and cozy fireplace. Large yard with mature trees.',
      price: 325000,
      type: 'House',
      status: 'for sale',
      location: {
        address: '789 Oak Street',
        city: 'Round Rock',
        state: 'TX',
        zipCode: '78664',
        country: 'USA'
      },
      features: {
        bedrooms: 3,
        bathrooms: 2,
        area: 1650,
        yearBuilt: 1965
      },
      amenities: ['Fireplace', 'Hardwood Floors', 'Washer/Dryer', 'Patio', 'Yard'],
      images: [
        'https://placehold.co/600x400/e74c3c/ffffff?text=Charming+Cottage',
        'https://placehold.co/600x400/2ecc71/ffffff?text=Living+Room',
        'https://placehold.co/600x400/f39c12/ffffff?text=Backyard'
      ],
      agent: {
        id: 'a3',
        name: 'Michael Brown',
        email: 'michael@realestatepro.com',
        phone: '(512) 555-9012',
        photo: 'https://placehold.co/200x200/3498db/ffffff?text=Michael+Brown',
        title: 'Residential Specialist'
      },
      tags: ['Charming'],
      createdAt: new Date('2023-09-05'),
      updatedAt: new Date('2023-09-10')
    },
    {
      id: '4',
      title: 'Modern Condo with City Views',
      description: 'Contemporary condo with floor-to-ceiling windows offering stunning city views. Open concept living space, designer kitchen, and luxurious bathroom finishes.',
      price: 395000,
      type: 'Condo',
      status: 'for sale',
      location: {
        address: '101 Tower Road, Unit 1205',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA'
      },
      features: {
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        yearBuilt: 2018
      },
      amenities: ['Gym', 'Pool', 'Balcony', 'Elevator', 'Security', 'Parking'],
      images: [
        'https://placehold.co/600x400/1abc9c/ffffff?text=Modern+Condo',
        'https://placehold.co/600x400/34495e/ffffff?text=Bedroom',
        'https://placehold.co/600x400/e67e22/ffffff?text=Bathroom'
      ],
      agent: {
        id: 'a1',
        name: 'John Smith',
        email: 'john@realestatepro.com',
        phone: '(512) 555-1234',
        photo: 'https://placehold.co/200x200/2c3e50/ffffff?text=John+Smith',
        title: 'Senior Agent'
      },
      tags: ['Modern', 'New'],
      createdAt: new Date('2023-09-12'),
      updatedAt: new Date('2023-09-12')
    },
    {
      id: '5',
      title: 'Spacious Family Home in Great School District',
      description: 'Large family home in top-rated school district. Features include a gourmet kitchen, master suite with spa bath, finished basement, and large backyard with deck.',
      price: 575000,
      type: 'House',
      status: 'for sale',
      location: {
        address: '222 Maple Avenue',
        city: 'Cedar Park',
        state: 'TX',
        zipCode: '78613',
        country: 'USA'
      },
      features: {
        bedrooms: 5,
        bathrooms: 3.5,
        area: 3200,
        yearBuilt: 2010
      },
      amenities: ['Basement', 'Deck', 'Garage', 'Fireplace', 'Central AC', 'Walk-in Closets'],
      images: [
        'https://placehold.co/600x400/3498db/ffffff?text=Family+Home',
        'https://placehold.co/600x400/2ecc71/ffffff?text=Kitchen',
        'https://placehold.co/600x400/e74c3c/ffffff?text=Backyard'
      ],
      agent: {
        id: 'a2',
        name: 'Sarah Johnson',
        email: 'sarah@realestatepro.com',
        phone: '(512) 555-5678',
        photo: 'https://placehold.co/200x200/e74c3c/ffffff?text=Sarah+Johnson',
        title: 'Luxury Properties Specialist'
      },
      tags: ['Family-Friendly'],
      createdAt: new Date('2023-08-30'),
      updatedAt: new Date('2023-09-02')
    },
    {
      id: '6',
      title: 'Historic Townhouse with Modern Updates',
      description: 'Beautifully restored townhouse combining historic character with modern amenities. Features include exposed brick walls, high ceilings, and a professionally designed kitchen.',
      price: 650000,
      type: 'Townhouse',
      status: 'for sale',
      location: {
        address: '333 Historic Lane',
        city: 'Austin',
        state: 'TX',
        zipCode: '78705',
        country: 'USA'
      },
      features: {
        bedrooms: 3,
        bathrooms: 2.5,
        area: 2100,
        yearBuilt: 1910
      },
      amenities: ['Exposed Brick', 'High Ceilings', 'Hardwood Floors', 'Gourmet Kitchen', 'Courtyard'],
      images: [
        'https://placehold.co/600x400/9b59b6/ffffff?text=Historic+Townhouse',
        'https://placehold.co/600x400/f39c12/ffffff?text=Kitchen',
        'https://placehold.co/600x400/3498db/ffffff?text=Bedroom'
      ],
      agent: {
        id: 'a3',
        name: 'Michael Brown',
        email: 'michael@realestatepro.com',
        phone: '(512) 555-9012',
        photo: 'https://placehold.co/200x200/3498db/ffffff?text=Michael+Brown',
        title: 'Residential Specialist'
      },
      tags: ['Historic', 'Renovated'],
      createdAt: new Date('2023-07-25'),
      updatedAt: new Date('2023-08-10')
    }
  ];

  constructor(private http: HttpClient) { }

  getAllProperties(): Observable<Property[]> {
    // For mock data
    return of(this.mockProperties);
    // For real API
    // return this.http.get<Property[]>(this.apiUrl);
  }

  getPropertyById(id: string): Observable<Property> {
    // For mock data
    const property = this.mockProperties.find(p => p.id === id);
    return of(property as Property);
    // For real API
    // return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  createProperty(property: Omit<Property, 'id'>): Observable<Property> {
    // Mock implementation
    const newId = (this.mockProperties.length + 1).toString();
    const newProperty = { ...property, id: newId, createdAt: new Date(), updatedAt: new Date() } as Property;
    this.mockProperties.push(newProperty);
    return of(newProperty);
    
    // Real API implementation - uncomment when backend is ready
    // return this.http.post<Property>(this.apiUrl, property);
  }

  updateProperty(id: string, property: Partial<Property>): Observable<Property> {
    // Mock implementation
    const index = this.mockProperties.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProperty = { 
        ...this.mockProperties[index], 
        ...property, 
        updatedAt: new Date() 
      };
      this.mockProperties[index] = updatedProperty;
      return of(updatedProperty);
    }
    return of({} as Property); // Return empty property if not found
    
    // Real API implementation - uncomment when backend is ready
    // return this.http.put<Property>(`${this.apiUrl}/${id}`, property);
  }

  deleteProperty(id: string): Observable<void> {
    // Mock implementation
    const index = this.mockProperties.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockProperties.splice(index, 1);
    }
    return of(undefined);
    
    // Real API implementation - uncomment when backend is ready
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Additional methods for filtering properties
  getPropertiesByType(type: string): Observable<Property[]> {
    // For mock data
    const filteredProperties = this.mockProperties.filter(p => 
      p.type.toLowerCase() === type.toLowerCase()
    );
    return of(filteredProperties);
    // For real API
    // return this.http.get<Property[]>(`${this.apiUrl}/type/${type}`);
  }

  getPropertiesByStatus(status: string): Observable<Property[]> {
    // For mock data
    const filteredProperties = this.mockProperties.filter(p => 
      p.status.toLowerCase() === status.toLowerCase()
    );
    return of(filteredProperties);
    // For real API
    // return this.http.get<Property[]>(`${this.apiUrl}/status/${status}`);
  }

  getPropertiesByLocation(city: string, state?: string): Observable<Property[]> {
    // For mock data
    let filteredProperties = this.mockProperties.filter(p => 
      p.location.city.toLowerCase().includes(city.toLowerCase())
    );
    
    if (state) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.state.toLowerCase() === state.toLowerCase()
      );
    }
    
    return of(filteredProperties);
    
    // For real API
    // let url = `${this.apiUrl}/location?city=${city}`;
    // if (state) {
    //   url += `&state=${state}`;
    // }
    // return this.http.get<Property[]>(url);
  }

  searchProperties(query: string): Observable<Property[]> {
    // For mock data
    const lowerQuery = query.toLowerCase();
    const filteredProperties = this.mockProperties.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      p.location.city.toLowerCase().includes(lowerQuery) ||
      p.location.address.toLowerCase().includes(lowerQuery)
    );
    return of(filteredProperties);
    
    // For real API
    // return this.http.get<Property[]>(`${this.apiUrl}/search?q=${query}`);
  }
  
  // Adding missing methods required by property-details.component.ts
  getSimilarProperties(id: string | number, type: string, city: string): Observable<Property[]> {
    // In a real app, this would be an API call like:
    // return this.http.get<Property[]>(`${this.apiUrl}/similar?id=${id}&type=${type}&city=${city}`);
    
    // For the mock version:
    return of(this.mockProperties.filter(property => 
      property.id !== id && 
      property.type === type &&
      property.location.city?.toLowerCase() === city?.toLowerCase()
    ));
  }
  
  submitContactRequest(formData: any): Observable<any> {
    // In a real app, this would make an API call
    // return this.http.post(`${this.apiUrl}/contact`, formData);
    return of({ success: true, message: 'Contact request submitted successfully' });
  }
  
  scheduleViewing(formData: any): Observable<any> {
    // In a real app, this would make an API call
    // return this.http.post(`${this.apiUrl}/schedule`, formData);
    return of({ success: true, message: 'Viewing scheduled successfully' });
  }
} 