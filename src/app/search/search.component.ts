import {
  Component,
  OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService, NavigateService, ConfirmModalComponent } from '../common';
import { AppSettings } from '..';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'search', 
  providers: [DataService],
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {
  private pageText: any = {};
  private view: string;
  private itemSet: Array<any>;
  private checkedItems: number = 0;
  private searchModel: string = '';
  private maxSelections: number = AppSettings.MAX_SELECTIONS;
  private started: boolean = false;
  private loaded: boolean = false;

  constructor(private navigateService: NavigateService, private dataService: DataService,
    private textService: TextService, private route: ActivatedRoute, private dialogService: DialogService) { }

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
      this.textService.getMiscTranslations().subscribe(
        data => this.setTranslations(data),
        error => console.error('Error getting translations: ' + error));
      if (dataView && dataView != this.view) {
        this.view = dataView;
        this.init();
      }
    });
  }

  private init() {
    window.scrollTo(0, 0);
    this.view.startsWith('food') ? this.dataService.loadFoods() : this.dataService.loadConditions();
    
    this.dataService.page = {
      text: 'Search by ' + (this.view.startsWith('food') ? 'Food or Remedy' : 'Health Concern'),
      name: 'Search',
      footerMargin: true,
      subtitle: true,
      hideFooter: true,
    };

    this.checkedItems = 0;
    let selectedItems = sessionStorage.getItem('selected' + this.view);
    // if (selectedItems) {
    //   this.initSelectedItems(JSON.parse(selectedItems));
    // } else {
    //   this.loaded = true;
    // }
    // don't preselect last selection
    this.deselectAll();
    this.loaded = true;
  }

  private verifyView(view: string): boolean {
    return view && (view === 'food' || view === 'condition' || view === 'food-20' || view === 'condition-20');
  }

  private setTranslations(data: any) {
    this.pageText.pleaseSelect = data["select_subtitle"] || "Please select up to " + AppSettings.MAX_SELECTIONS + " items";  
    this.pageText.selectWarning = data["select_warning"] || "Please select at least one item";  
    this.pageText.rtlFindWarning = data["rtl_find_warning"] || "";
    this.pageText.okButton = data["ok_button"] || "OK";
    this.pageText.find = data["find"] || "Find:";  
    this.pageText.deselectAll = data["deselect_button"] || "Deselect All";  
    this.pageText.search = data["search"] || "Search";
    if (this.view.startsWith('food') && data["menu_search_food"]) {
      this.dataService.page.text = data["menu_search_food"];
    } else if (this.view.startsWith('condition') && data["menu_search_condition"]) {
      this.dataService.page.text = data["menu_search_condition"];
    }
  }
  
  private onSelectItem(item: any) {
    item.checked = !item.checked;
    this.checkedItems += (item.checked) ? 1 : -1;
    let selectedItems = this.getSelectedItems();
    let itemName = 'selected' + this.view;
    sessionStorage.setItem(itemName, JSON.stringify(selectedItems));
  }

  private deselectAll() {
    let allItems = this.view.startsWith('food') ? this.dataService.allFoods : this.dataService.allConditions;
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
      sessionStorage.removeItem('currentSort');
      this.navigateService.navigateTo('benefits');
    } else {
      let disposable = this.dialogService.addDialog(ConfirmModalComponent, {
        title: this.pageText.selectWarning,
        rightJustify: this.textService.rightJustify,
        okText: this.pageText.okButton,
        hideCancel: true,
      })
        .subscribe(() => {})
      }
  }

  private initSelectedItems(selectedItems: any) {
    if (selectedItems && selectedItems.length > 0) {
      let allItems = this.view.startsWith('food') ? this.dataService.allFoods : this.dataService.allConditions;
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
    let allItems = this.view.startsWith('food') ? this.dataService.allFoods : this.dataService.allConditions;
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
    if (this.view.startsWith('food')) {
      this.itemSet = this.dataService.allFoods.filter(item => {
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1 || item.displayText.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    } else {
      this.itemSet = this.dataService.allConditions.filter(item => {
        return item.item.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1 || item.displayText.toLowerCase().indexOf(this.searchModel.toLowerCase()) > -1;
      });
    }
  }

  private clickFindInput(): void {
    // if (this.textService.rightJustify && this.pageText.rtlFindWarning) {
    //   if (!sessionStorage.getItem("shownRTLWarning")) {
    //     let disposable = this.dialogService.addDialog(ConfirmModalComponent, {
    //       title: " ",
    //       message: this.pageText.rtlFindWarning,
    //       rightJustify: true,
    //       okText: this.pageText.okButton,
    //       hideCancel: true,
    //     })
    //       .subscribe(() => {
    //         sessionStorage.setItem("shownRTLWarning", "true");
    //       })
    //     }
    // }
  }
}
