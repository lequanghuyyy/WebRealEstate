export interface AuthenticationRequest {
    username: string;
    password: string;
  }
  
  export interface TokenRequest {
    token: string;
  }
  
  export interface JwtDto {
    token: string;
    expiredIn: Date;
  }
  
  export interface UserCreationRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: string[];
  }
  
  export interface UserUpdateRequest {
    password?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    roles?: string[];
  }
  
  export enum UserStatus {
    ACTIVE = 'ACTIVE',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    REJECTED = 'REJECTED'
  }
  
  export interface UserResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    status: UserStatus;
    roles: string[];
    createAt: string;
    name?: string;
    photo?: string;
    phone?: string;
  }
  
  export interface BaseResponse<T> {
    status: string;
    description: string;
    data: T;
  }