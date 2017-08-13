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
import { NoContentComponent } from './no-content';
import { DataMonitorComponent } from './data-monitor';

import { ConfirmModalComponent } from './common';
import { PromptModalComponent } from './common';

import { AppState, InternalStateType } from './app.service';
import { DataService, TextService } from './common';
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
  AppState, DataService, TextService, CanActivateAgreement
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

  //public static API_ENDPOINT: string = 'https://nourai-food-app.herokuapp.com/';
  // LOCAL TESTING
  public static API_ENDPOINT: string = 'http://localhost:3000/';
  public static MAX_SELECTIONS: number = 10;
  public static NAV_MENU: Array<{ name: string, display: string, link: string, data?: any }> = [
    { name: 'Home', display: 'Home', link: 'home' },
    { name: 'Search by Health Food', display: 'Search by Food / Remedy', link: 'search', data: { view: 'food' } },
    { name: 'Search by Medical Condition', display: 'Search by Medical Concern', link: 'search', data: { view: 'condition' }  },
    { name: 'My Charts', display: 'My Charts', link: 'my-charts' },
    { name: 'Language', display: 'Language', link: 'language' },
    { name: 'Help', display: 'Help', link: 'help' }];
    
  public static FOOTER_LINKS: Array<{ name: string, display: string, link: string, data?: any }> = [
    { name: 'Terms and Conditions', display: 'Terms and Conditions', link: 'disclaimer' },
    { name: 'Privacy Policy', display: 'Privacy Policy', link: 'privacy' },
    { name: 'Contact Us', display: 'Contact Us', link: 'contact' }];
  public static LANGUAGES: Array<{ name: string, code: string }> = [
            { name: 'Afrikaans', code: 'af' },
            { name: 'Albanian', code: 'sq' },
            { name: 'Amharic', code: 'am' },
            { name: 'Arabic', code: 'ar' },
            { name: 'Armenian', code: 'hy' },
            { name: 'Azeerbaijani', code: 'az' },
            { name: 'Basque', code: 'eu' },
            { name: 'Belarusian', code: 'be' },
            { name: 'Bengali', code: 'bn' },
            { name: 'Bosnian', code: 'bs' },
            { name: 'Bulgarian', code: 'bg' },
            { name: 'Catalan', code: 'ca' },
            { name: 'Cebuano', code: 'ceb' },
            { name: 'Chichewa', code: 'ny' },
            { name: 'Chinese (Simplified)', code: 'zh-CN' },
            { name: 'Chinese (Traditional)', code: 'zh-TW' },
            { name: 'Corsican', code: 'co' },
            { name: 'Croatian', code: 'hr' },
            { name: 'Czech', code: 'cs' },
            { name: 'Danish', code: 'da' },
            { name: 'Dutch', code: 'nl' },
            { name: 'English', code: 'en' },
            { name: 'Esperanto', code: 'eo' },
            { name: 'Estonian', code: 'et' },
            { name: 'Filipino', code: 'tl' },
            { name: 'Finnish', code: 'fi' },
            { name: 'French', code: 'fr' },
            { name: 'Frisian', code: 'fy' },
            { name: 'Galician', code: 'gl' },
            { name: 'Georgian', code: 'ka' },
            { name: 'German', code: 'de' },
            { name: 'Greek', code: 'el' },
            { name: 'Gujarati', code: 'gu' },
            { name: 'Haitian Creole', code: 'ht' },
            { name: 'Hausa', code: 'ha' },
            { name: 'Hawaiian', code: 'haw' },
            { name: 'Hebrew', code: 'iw' },
            { name: 'Hindi', code: 'hi' },
            { name: 'Hmong', code: 'hmn' },
            { name: 'Hungarian', code: 'hu' },
            { name: 'Icelandic', code: 'is' },
            { name: 'Igbo', code: 'ig' },
            { name: 'Indonesian', code: 'id' },
            { name: 'Irish', code: 'ga' },
            { name: 'Italian', code: 'it' },
            { name: 'Japanese', code: 'ja' },
            { name: 'Javanese', code: 'jw' },
            { name: 'Kannada', code: 'kn' },
            { name: 'Kazakh', code: 'kk' },
            { name: 'Khmer', code: 'km' },
            { name: 'Korean', code: 'ko' },
            { name: 'Kurdish', code: 'ku' },
            { name: 'Kyrgyz', code: 'ky' },
            { name: 'Lao', code: 'lo' },
            { name: 'Latin', code: 'la' },
            { name: 'Latvian', code: 'lv' },
            { name: 'Lithuanian', code: 'lt' },
            { name: 'Luxembourgish', code: 'lb' },
            { name: 'Macedonian', code: 'mk' },
            { name: 'Malagasy', code: 'mg' },
            { name: 'Malay', code: 'ms' },
            { name: 'Malayalam', code: 'ml' },
            { name: 'Maltese', code: 'mt' },
            { name: 'Maori', code: 'mi' },
            { name: 'Marathi', code: 'mr' },
            { name: 'Mongolian', code: 'mn' },
            { name: 'Burmese', code: 'my' },
            { name: 'Nepali', code: 'ne' },
            { name: 'Norwegian', code: 'no' },
            { name: 'Pashto', code: 'ps' },
            { name: 'Persian', code: 'fa' },
            { name: 'Polish', code: 'pl' },
            { name: 'Portuguese', code: 'pt' },
            { name: 'Punjabi', code: 'ma' },
            { name: 'Romanian', code: 'ro' },
            { name: 'Russian', code: 'ru' },
            { name: 'Samoan', code: 'sm' },
            { name: 'Scots Gaelic', code: 'gd' },
            { name: 'Serbian', code: 'sr' },
            { name: 'Sesotho', code: 'st' },
            { name: 'Shona', code: 'sn' },
            { name: 'Sindhi', code: 'sd' },
            { name: 'Sinhala', code: 'si' },
            { name: 'Slovak', code: 'sk' },
            { name: 'Slovenian', code: 'sl' },
            { name: 'Somali', code: 'so' },
            { name: 'Spanish', code: 'es' },
            { name: 'Sundanese', code: 'su' },
            { name: 'Swahili', code: 'sw' },
            { name: 'Swedish', code: 'sv' },
            { name: 'Tajik', code: 'tg' },
            { name: 'Tamil', code: 'ta' },
            { name: 'Telugu', code: 'te' },
            { name: 'Thai', code: 'th' },
            { name: 'Turkish', code: 'tr' },
            { name: 'Ukrainian', code: 'uk' },
            { name: 'Urdu', code: 'ur' },
            { name: 'Uzbek', code: 'uz' },
            { name: 'Vietnamese', code: 'vi' },
            { name: 'Welsh', code: 'cy' },
            { name: 'Xhosa', code: 'xh' },
            { name: 'Yiddish', code: 'yi' },
            { name: 'Yoruba', code: 'yo' },
            { name: 'Zulu', code: 'zu' }
  ];
}
