import {
  Component,
  OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService, ApiService } from '../common';
import { AppSettings } from '..';

declare var google: any;  

@Component({
  selector: 'language',
  styleUrls: ['./language.component.scss'],
  templateUrl: './language.component.html'
})

  
export class LanguageComponent implements OnInit {
  private pageText: any = {};
  private selectedLang: string;
  private languageSet: Array<{ name: string, code: string }> = [];
  private searchModel: string = '';

  constructor(private apiService: ApiService, private router: Router, private dataService: DataService,
    private textService: TextService, private location: Location) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.selectedLang = this.textService.language;
    this.dataService.page = {
      text: 'Language',
      name: 'Language',
      footerMargin: false
    };
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error));

    //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
  }

  private setTranslations(data: any) {
    this.pageText.selectLanguage = data["select_language"] || "Please select a language:";  
    this.pageText.languageInfo = data["language_disclaimer"] || `Translations of food and health terms are available in the following languages.  
      Please note that these translations are a combination of manual and automated translating and may contain errors. 
      If you see any errors or would like to provide support in adding a new language please contact us.`;  
    this.pageText.contactUs = data["contact_us"] || "Contact us";
    this.dataService.page.text = data["menu_language"] || this.dataService.page.text;
    this.apiService.get(AppSettings.API_ROUTES.LANGUAGES, true).subscribe((langData) => {
      for (var i = 0; i < langData.length; i++) {
        langData[i] = data[langData[i].toLowerCase()] || langData[i];
      }
      this.languageSet = langData.sort();      
    });
  }

  private changeLanguage(language: string): void {
    this.textService.language = language;
    localStorage.setItem('lang', JSON.stringify(language));
    this.location.back();
  }
}
