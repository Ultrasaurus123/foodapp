import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService } from '../common';
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

  constructor(private http: Http, private router: Router, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.selectedLang = this.textService.language;
    this.dataService.currentPage = 'Language';
    this.textService.getText(['Language']).subscribe(
      text => this.dataService.currentPageText = text[0]);
    this.textService.getText(['Search:']).subscribe(
      text => this.pageText.search = text);
    this.languageSet = AppSettings.LANGUAGES;

    //new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
  }

  private searchValueChanged(newValue) {
    window.scrollTo(0, 0);
    this.searchModel = newValue;
  //  console.log(this.textService.getLanguages());
    //this.languageSet = AppSettings.LANGUAGES.filter(item => {
    //  return item.name.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
    //});
  }

  private changeLanguage(languageCode: string): void {
    this.textService.language = languageCode;
    this.router.navigateByUrl('home');
  }
}
