/**
 * Model representing API error responses from the backend
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  details: string;
} 