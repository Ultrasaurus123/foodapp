import {
  Component,
  OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService, NavigateService } from '../common';
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
  private loaded: boolean = false;

  constructor(private navigateService: NavigateService, private dataService: DataService, private textService: TextService, private route: ActivatedRoute) { }

  public ngOnInit() {
    this.navigateService.getRouteData(this.route).subscribe(data => {
      let dataView = (data) ? data.view : null;
      if (dataView && this.verifyView(dataView)) {
        this.view = dataView;
        this.init();
      } else {
        this.view = sessionStorage.getItem('view');
        if (this.view && this.verifyView(this.view)) {
          this.init();
        } else {
          this.navigateService.navigateTo('home');
        }
      }
    });
    // this.route
    //   .params
    //   .subscribe((data: any) => {
    //     let dataView = (data) ? data.view : null;
    //     if (dataView && this.verifyView(dataView)) {
    //       this.view = dataView;
    //       this.init();
    //     } else {
    //       this.view = sessionStorage.getItem('view');
    //       if (this.view && this.verifyView(this.view)) {
    //         this.init();
    //       } else {
    //         this.navigateService.navigateTo('home');
    //       }
    //     }
    //   });
  }
  
  public ngDoCheck() {
    this.navigateService.getRouteData(this.route).subscribe(data => {
      let dataView = (data) ? data['view'] : null;
      if (dataView && dataView != this.view) {
        this.view = dataView;
        this.init();
      }
    });
  }

  private init() {
    window.scrollTo(0, 0);
    
    //if (this.textService.language.toLowerCase() === 'english') {
      this.view === 'food' ? this.dataService.loadFoods() : this.dataService.loadConditions();
//    }
    
    this.dataService.page = {
      text: 'Search by ' + (this.view === 'food' ? 'Food or Remedy' : 'Health Concern'),
      name: 'Search',
      footerMargin: true
    };

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
      sessionStorage.removeItem('currentFilter');
      this.navigateService.navigateTo('benefits');
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
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1 || item.displayText.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    } else if (this.view === 'condition') {
      this.itemSet = this.dataService.allConditions.filter(item => {
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1 || item.displayText.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    }
  }
}
