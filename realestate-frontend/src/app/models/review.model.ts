export interface ReviewRequest {
  listingId: string;
  brId: string;
  title: string;
  contentReview: string;
  rate: number;
}

export interface ReviewResponse {
  id: string;
  listingId: string;
  brId: string;
  contentReview: string;
  title: string;
  rate: number;
  countLike: number;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
} 