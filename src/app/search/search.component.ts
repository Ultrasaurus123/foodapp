import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService } from '../common';
import { AppSettings } from '..';

@Component({
  selector: 'search', 
  providers: [DataService],
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {
  private allItems: Array<any>;
  private view: string;
  private itemSet: Array<any>;
  private checkedItems: number = 0;
  private searchModel: string = '';
  private maxSelections: number = AppSettings.MAX_SELECTIONS;
  private started: boolean = false;
  private pageText: any = {};
  private loaded: boolean = false;
  private sub: any;

  constructor(private http: Http, private router: Router, private dataService: DataService, private textService: TextService, private route: ActivatedRoute) { }

  public ngOnInit() {
    this.sub = this.route
      .params
      .subscribe((data: any) => {
        let dataView = (data) ? data.view : null;
        if (dataView && this.verifyView(dataView)) {
          this.view = dataView;
          this.init();
        } else {
          this.view = sessionStorage.getItem('view');
          if (this.view && this.verifyView(this.view)) {
            this.init();
          } else {
            this.router.navigateByUrl('home');
          }
        }
      });
  }
  
  public ngDoCheck() {
    this.sub = this.route.params.subscribe(data => {
      let dataView = (data) ? data['view'] : null;
      if (dataView && dataView != this.view) {
        this.view = dataView;
        this.init();
      }
    });
  }

  private init() {
    window.scrollTo(0, 0);
    this.view === 'food' ? this.dataService.loadFoods() : this.dataService.loadConditions();
    this.dataService.currentPage = 'Search';
    this.dataService.currentPageText = 'Search by ' + (this.view === 'food' ? 'Health Food' : 'Medical Condition');
    this.dataService.footerMargin = true;

    this.textService.getText([this.dataService.currentPageText]).subscribe(
      text => this.dataService.currentPageText = text[0]);
    this.textService.getText(['Deselect All', 'Search', 'Find:']).subscribe(text => {
      this.pageText.deselectAll = text[0]
      this.pageText.continue = text[1];
      this.pageText.search = text[2];
    });
    this.checkedItems = 0;
    let selectedItems = sessionStorage.getItem('selected' + this.view);
    if (selectedItems) {
      this.initSelectedItems(JSON.parse(selectedItems));
    } else {
      this.loaded = true;
    }
  }

  private verifyView(view: string): boolean {
    return view && (view === 'food' || view === 'condition');
  }

  private onSelectItem(item: any) {
    item.checked = !item.checked;
    this.checkedItems += (item.checked) ? 1 : -1;
    let selectedItems = this.getSelectedItems();
    let itemName = 'selected' + this.view;
    sessionStorage.setItem(itemName, JSON.stringify(selectedItems));
  }

  private deselectAll() {
    let allItems = (this.view === 'food') ? this.dataService.allFoods : this.dataService.allConditions;
    for (let item of allItems) {
      item.checked = false;
    }
    this.checkedItems = 0;
    let itemName = 'selected' + this.view;
    sessionStorage.setItem(itemName, JSON.stringify([]));
  }

  private selectItems = function () {
    if (this.checkedItems > 0)
    {
      let selectedItems = this.getSelectedItems();
      let itemName = 'selected' + this.view;
      sessionStorage.setItem(itemName, JSON.stringify(selectedItems));
      sessionStorage.setItem('view', this.view);
      this.router.navigateByUrl('benefits');
    }
  }

  private initSelectedItems(selectedItems: any) {
    if (selectedItems && selectedItems.length > 0) {
      let allItems = (this.view === 'food') ? this.dataService.allFoods : this.dataService.allConditions;
      for (let item of allItems) {
        for (let select of selectedItems) {
          if (item.item === select) {
            item.checked = true;
            this.checkedItems++;
            break;
          }
        }
        if (this.checkedItems === selectedItems.length) {
          break;
        }
      } 
    }
    this.loaded = true;
  }

  private getSelectedItems() {
    let allItems = (this.view === 'food') ? this.dataService.allFoods : this.dataService.allConditions;
    let selectedItems = [];
    for (let item of allItems) {
      if (item.checked) {
        selectedItems.push(item.item);
      }
    }
    return selectedItems;
  }

  private searchValueChanged(newValue) {
    window.scrollTo(0, 0);
    this.searchModel = newValue;
    if (this.view === 'food') {
      this.itemSet = this.dataService.allFoods.filter(item => {
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    } else if (this.view === 'condition') {
      this.itemSet = this.dataService.allConditions.filter(item => {
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    }
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
