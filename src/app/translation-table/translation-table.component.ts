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
import { DataService, TextService } from '../common';
import { AppSettings } from '..';

declare var google: any;  

@Component({
  selector: 'translation-table',
  styleUrls: ['./translation-table.component.scss'],
  templateUrl: './translation-table.component.html'
})

  
export class TranslationTableComponent implements OnInit {
  private pageText: any = {};
  private view: string = 'food';
  private searchModel: string = '';
  private itemSet: Array<string>;
  private foods: Array<any>;
  private conditions: Array<any>;
  private lastSort: string;
  
  constructor(private http: Http, private router: Router, private dataService: DataService,
    private textService: TextService, private location: Location) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.loadFoodsAndConditions();
    // this.dataService.loadConditions();
    this.foods = this.dataService.allFoods;
    this.conditions = this.dataService.allConditions;
    this.dataService.page = {
      text: 'Translation Table',
      name: 'Translation Table',
      footerMargin: true
    };
    this.pageText.search = 'Search:';    
  }

  private changeView() {
    this.view = this.view === 'food' ? 'condition' : 'food';
    this.searchModel = '';
  }

  private sort(language: string): void {
    this.foods.sort((a, b) => { return this.compareLanguage(a, b, language); });
    this.conditions.sort((a, b) => { return this.compareLanguage(a, b, language); });
    this.lastSort = (this.lastSort === language) ? '' : language;
  }

  private compareLanguage(a, b, language: string): number {
    let modifier: number = (language === this.lastSort) ? -1 : 1;
    let aWord = (language === 'English') ? a.item.toLowerCase() : a.displayText.toLowerCase();
    let bWord = (language === 'English') ? b.item.toLowerCase() : b.displayText.toLowerCase();
    if (aWord < bWord) {
      return -1 * modifier;
    }
    if (aWord > bWord) {
      return 1 * modifier;
    }
    return 0;
  }

  private searchValueChanged(newValue) {
    window.scrollTo(0, 0);
    this.searchModel = newValue;
    if (this.view === 'food') {
      this.itemSet = this.foods.filter(item => {
        let term = this.searchModel.toLowerCase();
        return item.item.toLowerCase().indexOf(term) > -1 || item.displayText.toLowerCase().indexOf(term) > -1;
      });
    } else if (this.view === 'condition') {
      this.itemSet = this.conditions.filter(item => {
        let term = this.searchModel.toLowerCase();
        return item.item.toLowerCase().indexOf(term) > -1 || item.displayText.toLowerCase().indexOf(term) > -1;
      });
    }
  }

  private getButtonLabel(): string {
    return 'Show ' + (this.view === 'condition' ? 'Foods' : 'Concerns');
  }
}
