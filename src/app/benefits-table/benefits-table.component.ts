import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { DomSanitizer, SafeHtml  } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { ApiService, DataService, PromptModalComponent, Chart, TextService, NavigateService } from '../common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'benefits-table',
  styleUrls: ['./benefits-table.component.scss'],
  templateUrl: './benefits-table.component.html'
})
export class BenefitsTableComponent implements OnInit {
  private selected: Array<string>;
  private selectedHeadings: Array<{ heading: string, displayText: string, displayTextLeft: string, displayTextRight: string, splitText: boolean }>;
  private view: string;
  private itemPopularity: any = {};
  private dataArray: Array<any>;
  private currentSort: { type: string, asc: boolean };
  private filterOptions: Array<{ name: string, checked: boolean }> = [];
  private selectedItems: Array<number> = [];
  private customHiddenItems: Array<number> = [];
  private hiddenByColumnFilter: any = {};
  private sub: any;
  private itemCount: number;
  private filteredColumns: any = {};
  private translatedItems: any = {};
  private translatedSelections: any = {};
  private tableView: { selection: string, items: string };
  private currentSessionFilters: any;
  private tabs: Array<PulloutTab> = [];
  

  constructor(private navigateService: NavigateService, private dataService: DataService, private apiService: ApiService, 
    private dialogService: DialogService, private route: ActivatedRoute, private textService: TextService, private domSanitizer: DomSanitizer) { }

  public ngOnInit() {
    this.createTabs();
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Health Effects Matrix',
      name: 'Benefits Matrix',
      footerMargin: false
    }
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        let customTable = params['customtable'] || '';
        if (customTable) {
          try {
            let parsedChart = <Chart>JSON.parse(atob(customTable));
            this.dataService.selectedChart = parsedChart;
          } catch (e) {
            console.error('Could not load custom chart, data malformed.');
            this.navigateService.navigateTo('home');            
          }
        }
        this.initNoParams();
      });
    
  }

  private ngAfterViewInit() {
    // open details tab on page load
    if (!sessionStorage.getItem('viewedDetailsTab')) {
      let detailsTab: PulloutTab;
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.tabs[i].name.toLowerCase() === "details") {
          detailsTab = this.tabs[i];
          break;
        }
      }
      if (detailsTab) {
        setTimeout(() => {
          this.openTab(detailsTab);
          setTimeout(() => {
            if (detailsTab.active) {
              this.openTab(detailsTab);
            }
            sessionStorage.setItem('viewedDetailsTab', "true");
          }, 3000);
        }, 1000);
      }
    }
  }

  
  private initNoParams() {
    //check if it's a custom MyChart
    if (this.dataService.selectedChart && this.dataService.selectedChart.selected) {
      this.init();
      this.view = this.dataService.selectedChart.view;
      this.selected = this.dataService.selectedChart.selected;
      sessionStorage.setItem('view', JSON.stringify(this.view));
      sessionStorage.setItem('selected', JSON.stringify(this.selected));
      sessionStorage.setItem('currentFilter', JSON.stringify(this.dataService.selectedChart.filters));
      this.dataService.selectedChart = null;
      this.initServiceCall();
    } else {
      //get state of this page
      this.view = sessionStorage.getItem('view');
      let selectedString: string = sessionStorage.getItem('selected' + this.view);
      this.selected = JSON.parse(selectedString);

      if (!this.selected || !this.view) {
        this.navigateService.navigateTo('home');
      } else {
        this.init();
        this.initServiceCall();      
      }
    }
  }

  private init = function () {
    this.heading = '';
    this.currentSort = {
      type: '',
      asc: true
    };
    this.filterOptions = [
      { name: 'Beneficial Effect', checked: false },
      { name: 'Assists', checked: false },
      { name: 'Mixed Effects', checked: false },
      { name: 'Inhibits', checked: false },
      { name: 'Negative Effect', checked: false }
    ];
    this.tableView = {
      selection: this.view,
      items: this.view === 'food' ? 'condition' : 'food'
    };
  };

  private initServiceCall = function () {
    let query = '';
    if (this.view === 'food') {
      query = 'foods=' + encodeURIComponent(this.selected.join());
    } else if (this.view === 'condition') {
      query = 'conditions=' + encodeURIComponent(this.selected.join());
    }

    this.textService.getTranslation(this.tableView.selection).subscribe(translatedSelections => {
      this.translatedSelections = translatedSelections;
      this.textService.getTranslation(this.tableView.items).subscribe(translatedItems => {
        this.translatedItems = translatedItems;
        // console.log(translatedItems);
        this.apiService.get(AppSettings.API_ROUTES.COMPACT + '?' + query, true)
        .subscribe(data => this.processData(data),
          error => console.error('Error getting all items: ' + error)
        );

      });
    });
  }  

  private processData(data: Array<any>, defaultSort: string) {
    this.processSelected();
    let hIndex: number = (this.view === 'food') ? 0 : 1;
    let dIndex: number = (this.view === 'food') ? 1 : 0;
    let dataHash = {};
    this.dataArray = [];
    for (let i = 1; i < data.length; i++) {
      dataHash[data[i][dIndex]] = dataHash[data[i][dIndex]] || {};
      dataHash[data[i][dIndex]][data[i][hIndex]] = {
        effect: data[i][2],
        top: data[i][3]
      };
      this.itemPopularity[data[i][dIndex]] = data[i][4];
    }
    // convert hash to array so we can sort/filter/manipulate easier
    this.itemCount = Object.keys(dataHash).length;

    //get session filter data
    let sessionFilterString: string = sessionStorage.getItem('currentFilter');
    this.currentSessionFilters = (sessionFilterString) ? JSON.parse(sessionFilterString) : {};
    this.currentSessionFilters.hidden = this.currentSessionFilters.hidden || [];
    this.currentSessionFilters.filters = this.currentSessionFilters.filters || [];    
    this.currentSessionFilters.columns = this.currentSessionFilters.columns || [];    
    this.customHiddenItems = this.currentSessionFilters.hidden;
    
    for (let item in dataHash) {
      let hidden = false;
      let hiddenIndex = this.currentSessionFilters.hidden.indexOf(item);
      if (hiddenIndex > -1) {
        hidden = true;
      }
      this.dataArray.push({ item: item, displayText: this.translatedItems[item.toLowerCase()] || item, values: dataHash[item], hidden: hidden, });
    }
      for (let i = 0; i < this.currentSessionFilters.filters.length; i++) {
        this.onFilterChange(this.currentSessionFilters.filters[i], true);
      }
      for (let i = 0; i < this.currentSessionFilters.columns.length; i++) {
        this.columnFilter(this.currentSessionFilters.columns[i]);
      }

      let sort = sessionStorage.getItem('currentSort');
      let sortParsed = JSON.parse(sort); 
      if (sortParsed && sortParsed.type) {
        this.currentSort = sortParsed;
        this.currentSort.asc = !sortParsed.asc;
        this.sort(sortParsed.type);
      } else {
        this.selected.length === 1 ? this.sort('az') : this.sort('effect');
      }  
}

  private processSelected() {
    this.selectedHeadings = [];
    let center = 15;
    for (let s = 0; s < this.selected.length; s++) {
      let selected = {
        heading: this.selected[s],
        displayText: this.translatedSelections[this.selected[s].toLowerCase()] || this.selected[s],
        displayTextRight: this.translatedSelections[this.selected[s].toLowerCase()] || this.selected[s],
        displayTextLeft: '',
        splitText: false
      };
      this.selectedHeadings.push(selected);
      if (selected.displayText.length > center) {
        let spaces = [], i = -1, closestToCenter = 0;
        while ((i = selected.displayText.indexOf(' ', i+1)) != -1) {
          spaces.push(i);
          closestToCenter = (Math.abs(center - i) < Math.abs(center - closestToCenter)) ? i : closestToCenter;
        }
        //if there are any spaces, break on space closest to center
        if (spaces.length > 0) {
          // let left = selected.displayText.slice(0, closestToCenter);
          // let right = selected.displayText.slice(closestToCenter + 1);
          // this.selectedHeadings[s].displayText = left + this.getSeparator() + right;
          this.selectedHeadings[s].displayTextLeft = selected.displayText.slice(0, closestToCenter);
          this.selectedHeadings[s].displayTextRight = selected.displayText.slice(closestToCenter + 1);
          this.selectedHeadings[s].splitText = true;
        }
        //otherwise hyphenate
        else {
        }
      }
    }
  }

  private getIcon = function (benefit): string {
    let icon = '../../assets/img/';
    if (benefit === '1') {
      icon += 'beneficial.png';
    } else if (benefit === '-1') {
      icon += 'negative.png';
    } else if (benefit === '2') {
      icon += 'assist.png';
    } else if (benefit === '-2') {
      icon += 'inhibit.png';
    } else if (benefit === 0) {
      icon += 'mixed.png';
    }
    return icon;
  };

  private getTableHeadingClass = function (splitText: boolean): string {
    let className: string = "table-headings";
    if (this.textService.rightJustify) {
      className += '-rtl';        
    }
    if (splitText) {
      className += '-two-line';  
    }

    if (this.selected.length > 1) {
      let numbers: string[] = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      className += ' ' + numbers[this.selected.length] + '-col';
    }
    return className;
  };

  private selectItem(item: any, index: number) {
    item.selected = !item.selected;

    if (item.selected) {
      this.selectedItems.push(index);
    } else {
      let i = this.selectedItems.indexOf(index);
      this.selectedItems.splice(i, 1);
    }
  }

  private resetSelection() {
    for (let i of this.selectedItems) {
      this.dataArray[i].selected = false;
    }
    this.selectedItems = [];
  }

  private removeRows() {
    if (this.selectedItems.length > 0) {
      for (let i of this.selectedItems) {
        this.dataArray[i].selected = false;
        this.dataArray[i].hidden = true;
        this.customHiddenItems.push(this.dataArray[i].item);
        if (this.currentSessionFilters.hidden.indexOf(this.dataArray[i].item) === -1) {
          this.currentSessionFilters.hidden.push(this.dataArray[i].item);
        }
      }
      this.selectedItems = [];
      sessionStorage.setItem('currentFilter', JSON.stringify(this.currentSessionFilters));
    }  
  }

  private removeRowsBelow() {
    if (this.selectedItems.length > 0) {
      let lowestSelected = 0;
      for (let i of this.selectedItems) {
        lowestSelected = (i > lowestSelected) ? i : lowestSelected;
      }

      for (let i = lowestSelected + 1; i < this.dataArray.length; i++) {
        this.dataArray[i].selected = false;
        this.dataArray[i].hidden = true;
        this.customHiddenItems.push(this.dataArray[i].item);
        if (this.currentSessionFilters.hidden.indexOf(this.dataArray[i].item) === -1) {
          this.currentSessionFilters.hidden.push(this.dataArray[i].item);
        }
      }
      sessionStorage.setItem('currentFilter', JSON.stringify(this.currentSessionFilters));
    }  
  }

  private showAllRows() {
    for (let item of this.dataArray) {
      item.hidden = false;
    }
    // this.dataArray = this.dataArray;
    for (let filter of this.filterOptions) {
      filter.checked = false;
    }
    this.customHiddenItems = [];
    this.filteredColumns = {};
    this.currentSessionFilters.hidden = [];
    this.currentSessionFilters.filters = [];
    this.currentSessionFilters.columns = [];
    sessionStorage.setItem('currentFilter', JSON.stringify(this.currentSessionFilters));
  }


  private getSortOrderIcon = function (sortType): string {
    if (this.currentSort && this.currentSort.type === sortType) {
      if (this.currentSort.asc) {
        return '&#8593;';
      } else {
        return '&#8595;';
      }
    }
    return '';
  };

  private sort(sortType: string, column?: string) {
    this.resetSelection();
    this.currentSort.asc = (this.currentSort.type === sortType) ? !this.currentSort.asc : true;
    this.currentSort.type = sortType;
    let orderFactor = (this.currentSort.asc) ? 1 : -1;

    switch (sortType) {
      case 'az':
        this.dataArray.sort(this.alphabeticSort(orderFactor));
        break;

      case 'benefit':
        this.dataArray.sort(this.benefitSort(orderFactor));
        break;

      case 'effect':
        this.dataArray.sort(this.effectSort(orderFactor));
        break;
        
      case 'popularity':
        this.dataArray.sort(this.popularitySort(orderFactor));
        break;
      
      case 'column':
        this.dataArray.sort(this.columnSort(orderFactor, column));
        break;
      default:
        break;
    }
    sessionStorage.setItem('currentSort', JSON.stringify(this.currentSort));
  }

  private alphabeticSort(orderFactor: number): any {
    return function (a, b) {
      if (a.displayText.toLowerCase() < b.displayText.toLowerCase()) {
        return -1 * orderFactor;
      } else if (a.displayText.toLowerCase() > b.displayText.toLowerCase()) {
        return 1 * orderFactor;
      }
      return 0;
    }
  }

  private benefitSort(orderFactor: number): any {
    return function (a, b) {
      let aCount: number = 0, bCount: number = 0;
      for (let item in a.values) {
        if (Number(a.values[item].effect) !== NaN && Number(a.values[item].effect) !== 0) {
          aCount += (Number(a.values[item].effect) > 0) ? 1 : -1;
          aCount += Number(a.values[item].top);
        }
      }
      for (let item in b.values) {
        if (Number(b.values[item].effect) !== NaN && Number(b.values[item].effect) !== 0) {
          bCount += (Number(b.values[item].effect) > 0) ? 1 : -1;
          bCount += Number(b.values[item].top);
        }
      }
      if (aCount > bCount) {
        return -1 * orderFactor;
      } else if (aCount < bCount) {
        return 1 * orderFactor;
      }
      return 0;
    }
  }

  private effectSort(orderFactor: number): any {
    return function (a, b) {
      let aHighlighted: number = 0, bHighlighted: number = 0;
      let aKeys = Object.keys(a.values);
      let bKeys = Object.keys(b.values);
      for (let item in a.values) {
        aHighlighted += Number(a.values[item].top);
      }
      for (let item in b.values) {
        bHighlighted += Number(b.values[item].top);
      }
      if (aKeys.length + aHighlighted > bKeys.length + bHighlighted) {
        return -1 * orderFactor;
      } else if (aKeys.length + aHighlighted < bKeys.length + bHighlighted) {
        return 1 * orderFactor;
      } else {
        let aCount: number = 0, bCount: number = 0;
        for (let item in a.values) {
          if (Number(a.values[item].effect) !== NaN && Number(a.values[item].effect) !== 0) {
            aCount += (Number(a.values[item].effect) > 0) ? 1 : -1;
            aCount += Number(a.values[item].top);
          }
        }
        for (let item in b.values) {
          if (Number(b.values[item].effect) !== NaN && Number(b.values[item].effect) !== 0) {
            bCount += (Number(b.values[item].effect) > 0) ? 1 : -1;
            bCount += Number(b.values[item].top);
          }
        }
        if (aCount > bCount) {
          return -1 * orderFactor;
        } else if (aCount < bCount) {
          return 1 * orderFactor;
        }
        return 0;
      }
    }
  }
  private popularitySort(orderFactor: number): any {
    return (a, b) => {
      if (Number(this.itemPopularity[a.item]) < Number(this.itemPopularity[b.item])) {
        return 1 * orderFactor;
      } else if (Number(this.itemPopularity[a.item]) > Number(this.itemPopularity[b.item])) {
        return -1 * orderFactor;
      }
      return 0;
    }
  }

  private columnSort(orderFactor: number, column: string): any {
    orderFactor = 1;
    return function (a, b) {
      let aValue = a.values[column].effect || -3;
      let bValue = b.values[column].effect || -3;
      if (aValue > bValue) {
        return -1 * orderFactor;
      } else if (aValue < bValue) {
        return 1 * orderFactor;
      }
      return 0;
    }
  }

  private columnFilter(column: string): any {
    // if filter already exists, unfilter
    if (this.hiddenByColumnFilter[column] && this.hiddenByColumnFilter[column].length > 0) {
      for (let i = 0; i < this.hiddenByColumnFilter[column].length; i++) {
        let item = this.hiddenByColumnFilter[column][i];
        if (this.currentSessionFilters.hidden.indexOf(this.dataArray[item].item) === -1) {
          this.dataArray[item].hidden = false;
        }  
      }
      this.filteredColumns[column] = false;

      //re-apply all other filters
      this.hiddenByColumnFilter = {};
      for (let col in this.filteredColumns) {
        if (this.filteredColumns[col]) {
          this.columnFilter(col);
        }  
      }
      for (let i = 0; i < this.currentSessionFilters.filters.length; i++) {
        this.onFilterChange(this.currentSessionFilters.filters[i], true);
      }
      
      if (this.currentSessionFilters.columns.indexOf(column) > -1) {
        this.currentSessionFilters.columns.splice(this.currentSessionFilters.columns.indexOf(column), 1);
      }
    }
    //else filter by column
    else {
      this.hiddenByColumnFilter[column] = [];
      for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i].values[column] == undefined) {
          this.dataArray[i].selected = false;
          this.dataArray[i].hidden = true;
          this.hiddenByColumnFilter[column].push(i);
        }
      }
      this.selectedItems = [];
      this.filteredColumns[column] = true; 
      if (this.currentSessionFilters.columns.indexOf(column) === -1) {
        this.currentSessionFilters.columns.push(column);
      }
    } 
    sessionStorage.setItem('currentFilter', JSON.stringify(this.currentSessionFilters));
  }

  private onFilterChange(index, newValue): void {
    this.resetSelection();
    this.filterOptions[index].checked = newValue;
    let beneficial: boolean = this.filterOptions[0].checked;
    let assist: boolean = this.filterOptions[1].checked;
    let mixed: boolean = this.filterOptions[2].checked;
    let inhibits: boolean = this.filterOptions[3].checked;
    let negative: boolean = this.filterOptions[4].checked;

    for (let item of this.dataArray) {
      let matchCount: number = 0;
      let valuesCount: number = 0;
      for (let value in item.values) {
        valuesCount++;
        let itemVal = Number(item.values[value].effect);
        if (itemVal !== NaN) {
          if ((beneficial && itemVal === 1) ||
            (assist && itemVal === 2) ||
            (mixed && itemVal === 0) ||
            (inhibits && itemVal === -2) ||
            (negative && itemVal === -1)) {
            matchCount++;
          }
        }
      }
    //  let hiddenItems: Array<string> = this.currentSessionFilters.hidden || [];
      if (matchCount === valuesCount) {
        item.hidden = true;
      } else {
        item.hidden = false;
      }
      for (let i = 0; i < this.currentSessionFilters.hidden.length; i++) {
        if (this.currentSessionFilters.hidden[i] === item.item) {
          item.hidden = true;
          break;
        }
      }
    // let hiddenIndex: number =  this.customHiddenItems.indexOf(item.item);
      // if (item.hidden && hiddenIndex === -1) {
      //   this.customHiddenItems.push(item.item);
      // } else if (!item.hidden && hiddenIndex > -1) {
      //  this.customHiddenItems.splice(hiddenIndex, 1);
      // }
      // this.currentSessionFilters.hidden =  this.customHiddenItems;

    }
      //update session filters
      if (newValue && this.currentSessionFilters.filters.indexOf(index) === -1) {
        this.currentSessionFilters.filters.push(index);
      } else if (!newValue && this.currentSessionFilters.filters.indexOf(index) > -1) {
        this.currentSessionFilters.filters.splice(this.currentSessionFilters.filters.indexOf(index), 1)
      }
      sessionStorage.setItem('currentFilter', JSON.stringify(this.currentSessionFilters));
  }

  private saveChart() {
    let disposable = this.dialogService.addDialog(PromptModalComponent, {
      title: 'Save Chart',
      question: 'Chart Name:'
    })
      .subscribe((message) => {
        if (message) {
          let c: string = localStorage.getItem('myCharts');
          let charts: Array<Chart> = [];
          if (c) {
            charts = JSON.parse(c);
          }
          let chartData = {
            name: message,
            filters: this.currentSessionFilters,
            selected: this.selected,
            view: this.view
          };
          charts.push(chartData);
          localStorage.setItem('myCharts', JSON.stringify(charts));
        }
      })
  }

  private goToDetails(selection, i) {
    if (this.view === 'food') {
      let details = { food: selection, condition: this.dataArray[i].item };
      sessionStorage.setItem('details', JSON.stringify(details));
    }
    else {
      let details = { food: this.dataArray[i].item, condition: selection };
      sessionStorage.setItem('details', JSON.stringify(details));
    }
    this.navigateService.navigateTo('details');
  }

  private showEnglish() {
    for (let index of this.selectedItems) {
      this.dataArray[index].showEnglish = true;
    }
  }

  private removeAllEnglish() {
    for (let item of this.dataArray) {
      item.showEnglish = false;
    }
  }

  private createTabs(): void {
    let tabNames: Array<string> = [
      "Help", "Details", "Sort", "Filter", "Save", "Icons", "English"
    ];
    let tabHeight: number = 1. / tabNames.length * 90;

    for (let i = 0; i < tabNames.length; i++) {
      this.tabs.push({
        name: tabNames[i],
        image: "../../assets/img/tab-" + tabNames[i].toLowerCase() + ".png",
        height: tabHeight,
        top: tabHeight * i + 1 * i,
        hidden: tabNames[i] === this.textService.language
      });
    }
    console.log(this.tabs);
  }

  private openTab(tab: PulloutTab): void {
    if (tab.name === "Save") {
      this.saveChart();
      return;
    }
    if (tab.active) {
      tab.active = false;
      return;
    }
    for (let t of this.tabs) {
      t.active = false;
    }
    tab.active = true;
  }
}

export interface PulloutTab {
  name: string;
  image: string;
  height: number;
  top: number;
  active?: boolean;
  hidden?: boolean;
}