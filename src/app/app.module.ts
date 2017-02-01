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

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { PageHeaderComponent } from './common';
import { AgreementComponent } from './agreement';
import { HomeComponent } from './home';
import { BenefitsTableComponent } from './benefits-table';
import { DetailsComponent } from './details';
import { NoContentComponent } from './no-content';

import { AppState, InternalStateType } from './app.service';
import { DataService } from './common';
import { CanActivateAgreement } from './common';

import { KeysPipe } from './common';

import '../styles/styles.scss';
import '../styles/headings.scss';
import '../styles/margins.scss';
import '../styles/loader.scss';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState, DataService, CanActivateAgreement
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
    AgreementComponent,
    HomeComponent,
    BenefitsTableComponent,
    DetailsComponent,
    NoContentComponent,
    KeysPipe
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
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
  public static API_ENDPOINT: string = 'https://nourai-food-app.herokuapp.com/';
  public static MAX_SELECTIONS: number = 10;
  public static NAV_MENU: Array<{ name: string, link: string }> = [
    { name: 'Home', link: 'home' },
    { name: 'My Charts', link: 'my-charts' },
    { name: 'Settings', link: 'settings' },
    { name: 'Help', link: 'help' },
    { name: 'About', link: 'about' }];
}