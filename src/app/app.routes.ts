import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { BenefitsTableComponent } from './benefits-table';
import { DetailsComponent } from './details';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'benefits', component: BenefitsTableComponent },
  { path: 'details', component: DetailsComponent },
  // { path: 'detail', loadChildren: './+detail#DetailModule'},
  // { path: 'barrel', loadChildren: './+barrel#BarrelModule'},
  { path: '**',    component: NoContentComponent },
];
