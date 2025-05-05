import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ContactComponent } from './components/contact/contact.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { BuyComponent } from './components/buy/buy.component';
import { RentComponent } from './components/rent/rent.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { TermsComponent } from './components/terms/terms.component';
import { AboutComponent } from './components/about/about.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SitemapComponent } from './components/sitemap/sitemap.component';
import { AgentDashboardComponent } from './components/agent/dashboard/agent-dashboard.component';
import { AgentTransactionsComponent } from './components/agent/transactions/agent-transactions.component';
import { CreateListingComponent } from './components/agent/create-listing/create-listing.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { ApiTestComponent } from './components/debug/api-test.component';

// Admin components
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin/dashboard/admin-dashboard.component';
import { adminGuard } from './components/admin/shared/admin.guard';

// Agent Guard - only allows agents to access certain routes
const agentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  
  if (!authService.isAgent()) {
    router.navigate(['/']);
    return false;
  }
  
  return true;
};

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      
      // Nếu người dùng đã đăng nhập và có quyền admin, chuyển hướng đến trang admin
      if (authService.isLoggedIn() && authService.isAdmin()) {
        router.navigate(['/admin/dashboard']);
        return false;
      }
      
      return true;
    }]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'property/:id', component: PropertyDetailsComponent },
  { path: 'buy', component: BuyComponent },
  { path: 'properties', component: PropertiesComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'sitemap', component: SitemapComponent },
  { path: 'rent', component: RentComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'api-test', component: ApiTestComponent },
  { 
    path: 'profile', 
    component: ProfileComponent,
    children: [
      { path: 'favorites', component: ProfileComponent },
      { path: 'saved-searches', component: ProfileComponent },
      { path: 'appointments', component: ProfileComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },
  // Agent routes
  {
    path: 'agent',
    canActivate: [agentGuard],
    children: [
      { path: 'dashboard', component: AgentDashboardComponent },
      { path: 'dashboard/viewings', component: AgentDashboardComponent },
      { path: 'transactions', component: AgentTransactionsComponent },
      { path: 'create-listing', component: CreateListingComponent },
      { path: 'edit-listing/:id', component: CreateListingComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Admin direct route for testing
  { 
    path: 'admin-test', 
    component: AdminDashboardComponent,
    canActivate: [() => {
      const authService = inject(AuthService);
      return true; // Allow access for testing
    }]
  },
  // Admin routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent 
      },
      { 
        path: 'users', 
        loadComponent: () => import('./components/admin/users/admin-users.component').then(m => m.AdminUsersComponent) 
      },
      { 
        path: 'listings', 
        loadComponent: () => import('./components/admin/listings/admin-listings.component').then(m => m.AdminListingsComponent) 
      },
      { 
        path: 'transactions', 
        loadComponent: () => import('./components/admin/transactions/admin-transactions.component').then(m => m.AdminTransactionsComponent) 
      },
      { 
        path: 'payments', 
        loadComponent: () => import('./components/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent) 
      },
      { 
        path: 'reviews', 
        loadComponent: () => import('./components/admin/reviews/admin-reviews.component').then(m => m.AdminReviewsComponent) 
      },
      { 
        path: 'contacts', 
        loadComponent: () => import('./components/admin/contacts/admin-contacts.component').then(m => m.AdminContactsComponent) 
      },
      { 
        path: 'agent-applications', 
        loadComponent: () => import('./components/admin/agent-applications/agent-applications.component').then(m => m.AgentApplicationsComponent) 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },  
  { 
    path: 'logout',
    canActivate: [() => {
      const router = inject(Router);
      const authService = inject(AuthService);
      authService.logout();
      router.navigate(['/']);
      return false;
    }],
    component: HomeComponent
  },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '' }
];
