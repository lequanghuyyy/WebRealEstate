export interface RecommendationResponse {
  listingIds: string[];  // Recently viewed or favorited listings
  cities: string[];      // Cities user has searched for
  propertyType: string;  // SALE or RENT
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  keywords: string[];
} 