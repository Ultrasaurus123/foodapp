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
    this.pageText.search = 'Search:';
    this.apiService.get('getLanguages', true).subscribe((data) => {
      this.languageSet = data;      
    });

    //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
  }

  private searchValueChanged(newValue) {
    window.scrollTo(0, 0);
    this.searchModel = newValue;
    //this.languageSet = AppSettings.LANGUAGES.filter(item => {
    //  return item.name.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
    //});
  }

  private changeLanguage(language: string): void {
    this.textService.language = language;
    sessionStorage.setItem('lang', JSON.stringify(language));
    this.location.back();
  }
}
