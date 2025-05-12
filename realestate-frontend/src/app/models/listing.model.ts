export enum ListingType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export enum ListingStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  DELISTED = 'DELISTED'
}

export enum ListingPropertyType {
  House = 'House',
  Apartment = 'Apartment',
  Villa = 'Villa'
}

export interface ListingModel {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  image: string;
  price: number;
  area: number;
  view: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  type: ListingType;
  status: ListingStatus;
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  propertyType: ListingPropertyType;
}

export interface ListingSearchRequest {
  keyword?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  type?: ListingType;
  propertyType?: ListingPropertyType;
  status?: ListingStatus;
  page?: number;
  size?: number;
}

export interface PageDto<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface BaseResponse<T> {
  status: string;
  description: string;
  data: T;
}

export interface ListingResponse extends ListingModel {
}

export interface ListingRequest {
  title: string;
  description: string;
  address: string;
  city: string;
  image: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  view?: number;
  type: ListingType;
  propertyType: ListingPropertyType;
  ownerId: string;
}

export interface ListingStatusUpdateRequest {
  status: ListingStatus;
} 