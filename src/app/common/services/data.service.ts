import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Http, Response } from '@angular/http';
import { AppSettings } from '../..';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { TextService } from './text.service';

@Injectable()
export class DataService {

  public appName: string = 'Food App';
  public allFoods: Array<any> = [];
  public allConditions: Array<any> = [];
  public agreement: boolean = false;
  public currentPageText: string;
  public currentPage: string;
  public footerMargin: boolean = false;
  public myCharts: Array<any> = [];
  public selectedChart: any = {};

  private static _instance: DataService;

  constructor(private http: Http, private textService: TextService) {
    return DataService._instance = DataService._instance || this;
  }  

  public loadFoods(): Subscription {
    if (this.allFoods && this.allFoods.length > 0) {
      return Subscription.EMPTY;
    }
    return this.http.get(AppSettings.API_ENDPOINT + 'foods')
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
      foods => {
        this.allFoods = foods; this.textService.getText(this.allFoods.map(function (elem) {
          return elem.item;
        })).subscribe(
          data => console.log(data)
          );
      },
      error => console.error('Error getting all foods: ' + error));
  }

  public loadConditions(): Subscription {
    if (this.allConditions && this.allConditions.length > 0) {
      return Subscription.EMPTY;
    }
    return this.http.get(AppSettings.API_ENDPOINT + 'conditions')
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
      conditions => {
        this.allConditions = conditions; this.textService.getText(this.allConditions.map(function (elem) {
          return elem.item;
        })).subscribe(
          data => console.log(data)
          );
      },
      error => console.error('Error getting all conditions: ' + error));
  }

  
  private extractData(res: Response) {
    let body = res.json();
    let returnData = [];
    for (let item of body) {
      returnData.push({ item: item, checked: false });
    }
    return returnData || {};
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
