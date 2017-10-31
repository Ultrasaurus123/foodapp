import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

import { BootstrapModalModule } from 'ng2-bootstrap-modal';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { PageHeaderComponent } from './common';
import { PageFooterComponent } from './common';
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
import { TranslationTableComponent } from './translation-table';
import { NoContentComponent } from './no-content';
import { DataMonitorComponent } from './data-monitor';

import { ConfirmModalComponent } from './common';
import { PromptModalComponent } from './common';

import { AppState, InternalStateType } from './app.service';
import { ApiService, DataService, TextService, NavigateService } from './common';
import { CanActivateAgreement } from './common';

import { KeysPipe } from './common';

import { FocusDirective } from './common';

import '../styles/styles.scss';
import '../styles/headings.scss';
import '../styles/margins.scss';
import '../styles/page-loading.scss';
import '../styles/loader.scss';
import '../styles/modals.scss';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState, ApiService, DataService, TextService, NavigateService, CanActivateAgreement
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    PageHeaderComponent,
    PageFooterComponent,
    AgreementComponent,
    PrivacyPolicyComponent,
    HomeComponent,
    SearchComponent,
    MyChartsComponent,
    BenefitsTableComponent,
    DetailsComponent,
    WarningsComponent,
    HelpComponent,
    LanguageComponent,
    TranslationTableComponent,
    NoContentComponent,
    KeysPipe,
    ConfirmModalComponent,
    PromptModalComponent,
    FocusDirective,
    DataMonitorComponent
  ],
  imports: [ // import Angular's modules  
    BrowserModule,
    FormsModule,
    HttpModule,
    BootstrapModalModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  entryComponents: [
    ConfirmModalComponent,
    PromptModalComponent
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {

  constructor(
    public appRef: ApplicationRef,
    public appState: AppState
  ) { }

  public hmrOnInit(store: StoreType) {
    if (!store || !store.state) {
      return;
    }
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  public hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map((cmp) => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  public hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}

// Global Application Settings
export class AppSettings {
  public static APP_NAME: string = 'Health Foods Matrix';

  public static API_ENDPOINT: string = 'https://nourai-food-app.herokuapp.com/';
  // LOCAL TESTING
  // public static API_ENDPOINT: string = 'http://localhost:3000/';

  public static FACEBOOK_LINK: string = 'http://www.facebook.com/Health-Foods-Matrix-1004157829720976/';  

  public static MAX_SELECTIONS: number = 10;
  public static NAV_MENU: Array<{ name: string, display: string, link: string, data?: any }> = [
    { name: 'Home', display: 'Home', link: 'home' },
    { name: 'Search by Health Food', display: 'Search by Food or Remedy', link: 'search', data: { view: 'food' } },
    { name: 'Search by Medical Condition', display: 'Search by Health Concern', link: 'search', data: { view: 'condition' }  },
    { name: 'My Charts', display: 'My Charts', link: 'my-charts' },
    { name: 'Language', display: 'Language', link: 'language' },
    { name: 'Translation Table', display: 'Translation Table', link: 'translation-table' },
    { name: 'Help', display: 'Help', link: 'help' },
    { name: 'Feedback', display: 'Provide Feedback', link: 'feedback' },
    { name: 'Facebook', display: 'Follow us on Facebook', link: 'facebook' }];
    
  public static FOOTER_LINKS: Array<{ name: string, display: string, link: string, data?: any }> = [
    { name: 'Terms and Conditions', display: 'Terms and Conditions', link: 'disclaimer' },
    { name: 'Privacy Policy', display: 'Privacy Policy', link: 'privacy' },
    { name: 'Contact Us', display: 'Contact Us', link: 'contact' }];
  
  public static RIGHT_JUSTIFIED_LANGUAGES: any = {
    'persian': true,
    'arabic': true
  };
}
