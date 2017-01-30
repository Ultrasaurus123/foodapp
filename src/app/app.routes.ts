import { Routes, RouterModule } from '@angular/router';
import { CanActivateAgreement } from './common';
import { AgreementComponent } from './agreement';
import { HomeComponent } from './home';
import { BenefitsTableComponent } from './benefits-table';
import { DetailsComponent } from './details';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '',      component: AgreementComponent, data: {name: 'Disclaimer'} },
  { path: 'home',  component: HomeComponent, canActivate: [CanActivateAgreement], data: {name: 'Home'}  },
  { path: 'benefits', component: BenefitsTableComponent, canActivate: [CanActivateAgreement] },
  { path: 'details', component: DetailsComponent, canActivate: [CanActivateAgreement] },
  { path: '**',    component: NoContentComponent},
];
