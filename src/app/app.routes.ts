import { Routes, RouterModule } from '@angular/router';
import { CanActivateAgreement } from './common';
import { AgreementComponent } from './agreement';
import { PrivacyPolicyComponent } from './privacy-policy';
import { HomeComponent } from './home';
import { SearchComponent } from './search';
import { MyChartsComponent } from './my-charts';
import { BenefitsTableComponent } from './benefits-table';
import { DetailsComponent } from './details';
import { WarningsComponent } from './warnings';
import { HelpComponent } from './help';
import { LanguageComponent } from './language';
import { NoContentComponent } from './no-content';
import { DataMonitorComponent } from './data-monitor';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: '', component: HomeComponent},
  { path: 'disclaimer', component: AgreementComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'home', component: HomeComponent},
  { path: 'search', component: SearchComponent, canActivate: [CanActivateAgreement] },
  { path: 'my-charts', component: MyChartsComponent, canActivate: [CanActivateAgreement] },
  { path: 'benefits', component: BenefitsTableComponent, canActivate: [CanActivateAgreement] },
  { path: 'details', component: DetailsComponent, canActivate: [CanActivateAgreement] },
  { path: 'warnings', component: WarningsComponent, canActivate: [CanActivateAgreement] },
  { path: 'help', component: HelpComponent },
  { path: 'language', component: LanguageComponent },
  { path: 'datamonitor', component: DataMonitorComponent },
  { path: '**', component: NoContentComponent },
];
