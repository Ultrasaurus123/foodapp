import { Routes, RouterModule } from '@angular/router';
import { CanActivateAgreement } from './common';
import { AgreementComponent } from './agreement';
import { HomeComponent } from './home';
import { SearchComponent } from './search';
import { MyChartsComponent } from './my-charts';
import { BenefitsTableComponent } from './benefits-table';
import { DetailsComponent } from './details';
import { WarningsComponent } from './warnings';
import { LanguageComponent } from './language';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', component: HomeComponent, canActivate: [CanActivateAgreement]  },
  { path: 'disclaimer', component: AgreementComponent },
  { path: 'home', component: HomeComponent, canActivate: [CanActivateAgreement] },
  { path: 'search', component: SearchComponent, canActivate: [CanActivateAgreement] },
  { path: 'my-charts', component: MyChartsComponent, canActivate: [CanActivateAgreement] },
  { path: 'benefits', component: BenefitsTableComponent, canActivate: [CanActivateAgreement] },
  { path: 'details', component: DetailsComponent, canActivate: [CanActivateAgreement] },
  { path: 'warnings', component: WarningsComponent, canActivate: [CanActivateAgreement] },
  { path: 'language', component: LanguageComponent },
  { path: '**', component: NoContentComponent },
];
