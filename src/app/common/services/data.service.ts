import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { AppSettings } from '../..';
import { Chart } from '..';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ApiService } from './api.service';
import { TextService } from './text.service';

@Injectable()
export class DataService {

  public allFoods: Array<any> = [];
  public allConditions: Array<any> = [];
  public translatedFoods:  Array<any> = [];;
  public translatedConditions:  Array<any> = [];;
  public agreement: boolean = false;
  public dataLoading: boolean = false;
  public loadedFoodSinceLangChange: boolean = true;
  public loadedCondSinceLangChange: boolean = true;
  // public currentPageText: string;
  // public currentPage: string;
  // public footerMargin: boolean = false;
  public myCharts: Array<Chart> = [];
  public selectedChart: Chart = null;
  public disclaimerRedirectUrl: string;
  public page: { name: string, text: string, footerMargin?: boolean, search?: boolean };

  private static _instance: DataService;

  constructor(private apiService: ApiService, private textService: TextService) {
    return DataService._instance = DataService._instance || this;
  }  

  public loadFoods(): Subscription {
    this.dataLoading = true;
    if (this.allFoods && this.allFoods.length > 0 && !this.textService.languageChanged) {
      this.dataLoading = false;      
      return Subscription.EMPTY;
    }
    this.textService.loadAfterChange('food');
    return this.apiService.get('foods', true)
      .subscribe(
      foods => {
        this.allFoods = this.extractData(foods);
        return this.textService.getTranslation('food').subscribe(translated => {
          for (var i = 0; i < this.allFoods.length; i++) {
            this.allFoods[i].displayText = translated[this.allFoods[i].item.toLowerCase()] || this.allFoods[i].item;
          }
          this.allFoods.sort(this.alphabeticSort());
          this.dataLoading = false;                
        });
      },
      error => console.error('Error getting all foods: ' + error));
  }

  public loadConditions(): Subscription {
    this.dataLoading = true;    
    if (this.allConditions && this.allConditions.length > 0 && !this.textService.languageChanged) {
      this.dataLoading = false;            
      return Subscription.EMPTY;
    }
    this.textService.loadAfterChange('condition');
    return this.apiService.get('conditions', true)
      .subscribe(
      conditions => {
        this.allConditions = this.extractData(conditions);
        return this.textService.getTranslation('condition').subscribe(translated => {
          for (var i = 0; i < this.allConditions.length; i++) {
            this.allConditions[i].displayText = translated[this.allConditions[i].item.toLowerCase()] || this.allConditions[i].item;
          }
          this.allConditions.sort(this.alphabeticSort());          
          this.dataLoading = false;                
        });
      },
      error => console.error('Error getting all conditions: ' + error));
  }

  public loadFoodsAndConditions(): Subscription {
    this.dataLoading = true;    
    if (this.allFoods && this.allFoods.length > 0 && this.allConditions && this.allConditions.length > 0 && !this.textService.languageChanged) {
      this.dataLoading = false;            
      return Subscription.EMPTY;
    }
    this.textService.loadAfterChange('food');
    this.textService.loadAfterChange('condition');
    Observable.forkJoin([this.apiService.get('foods', true), this.apiService.get('conditions', true)]).subscribe(
      items => {
        let foods = items[0];
        let conditions = items[1];
        this.allFoods = this.extractData(foods);
        this.allConditions = this.extractData(conditions);
        return Observable.forkJoin([this.textService.getTranslation('food'), this.textService.getTranslation('condition')]).subscribe(
          translated => {
            let translatedFoods = translated[0];
            let translatedConditions = translated[1];
            for (var i = 0; i < this.allFoods.length; i++) {
              this.allFoods[i].displayText = translatedFoods[this.allFoods[i].item.toLowerCase()] || this.allFoods[i].item;
            }
            this.allFoods.sort(this.alphabeticSort());
            for (var i = 0; i < this.allConditions.length; i++) {
              this.allConditions[i].displayText = translatedConditions[this.allConditions[i].item.toLowerCase()] || this.allConditions[i].item;
            }
            this.allConditions.sort(this.alphabeticSort());          
            this.dataLoading = false;                  
            });
        })
      error => console.error('Error getting all foods: ' + error);
  }

  
  private extractData(body: any): Array<any> {
//    let body = res.json();
    let returnData = [];
    for (let item of body) {
      returnData.push({ item: item, checked: false });
    }
    return returnData || [];
  }

  private alphabeticSort(): any {
    return function (a, b) {
      if (a.displayText.toLowerCase() < b.displayText.toLowerCase()) {
        return -1;
      } else if (a.displayText.toLowerCase() > b.displayText.toLowerCase()) {
        return 1;
      }
      return 0;
    }
  }
}
