import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router} from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService } from '../common';
import { AppSettings } from '..';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [DataService],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./home.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private allFoods: Array<any>;
  private allConditions: Array<any>;
  private itemSet: Array<any>;
  private showFood: boolean = false;
  private showCondition: boolean = false;
  private checkedFoods: number = 0;
  private checkedConditions: number = 0;
  private searchModel: string = '';
  private maxSelections: number = AppSettings.MAX_SELECTIONS;

  constructor(private http: Http, private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0,0); 
    this.http.get(AppSettings.API_ENDPOINT + 'foods')
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        foods => this.dataService.allFoods = foods,
        error => console.error('Error getting all foods: ' + error)
      )

  this.http.get(AppSettings.API_ENDPOINT + 'conditions')
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(
        conditions => this.dataService.allConditions = conditions,
        error => console.error('Error getting all conditions: ' + error)
      )
  }

  private getItemList(): Array<any> {
    if (this.showFood) {
      return (this.searchModel) ? this.itemSet : this.dataService.allFoods;
    } else if (this.showCondition) {
      return (this.searchModel) ? this.itemSet : this.dataService.allConditions;
    }
    return [];
  }

  private showItemList(type) {
    window.scrollTo(0,0);
    this.showFood = type === 'food';
    this.showCondition = type === 'condition';
    this.searchModel = '';
  }

  private onSelectItem(item: any, type: string) {
    // if checked is false, we are just now checking the box
    if (item.checked === false) {
      if (type === 'food') {
        this.checkedFoods++;
      } else if (type === 'condition') {
        this.checkedConditions++;
      }
    } else {
    if (type === 'food') {
        this.checkedFoods--
      } else if (type === 'condition') {
        this.checkedConditions--;
      }
    }
  }

  private selectItems = function () {
    let item = (this.showFood) ? 'food' : 'condition'; 
      sessionStorage.setItem('view', item);
      if (item === 'food') {
        sessionStorage.setItem('selected', JSON.stringify(this.getSelectedItems(this.dataService.allFoods)));
      } else if (item === 'condition') {
        sessionStorage.setItem('selected', JSON.stringify(this.getSelectedItems(this.dataService.allConditions)));
      }
      this.router.navigateByUrl('benefits');
    }

    private getSelectedItems(allItems: Array<any>) {
      let selectedItems = [];
      for (let item of allItems) {
        if (item.checked) {
          selectedItems.push(item.item);
        }
      }
      return selectedItems;
    }

    private searchValueChanged(newValue) {
      window.scrollTo(0,0);
      this.searchModel = newValue;
      if (this.showFood) {
        this.itemSet = this.dataService.allFoods.filter(item => {
           return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
        });
      } else if (this.showCondition) {
        this.itemSet = this.dataService.allConditions.filter(item => {
           return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
        });
      }
    }


  private extractData(res: Response) {
    let body = res.json();
    let returnData = [];
    for (let item of body) {
      returnData.push({item: item, checked: false});        
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
