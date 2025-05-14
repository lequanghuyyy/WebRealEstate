import { Routes } from '@angular/router';
import { AdminListingsComponent } from './admin-listings.component';
import { AdminListingEditComponent } from './edit/admin-listing-edit.component';

export const ADMIN_LISTINGS_ROUTES: Routes = [
  {
    path: '',
    component: AdminListingsComponent
  },
  {
    path: 'edit/:id',
    component: AdminListingEditComponent
  }
]; 