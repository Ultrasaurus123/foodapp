import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
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
  private hideUnpopularThreshold: number;
  private selected: Array<string>;
  private selectedHeadings: Array<{ heading: string, displayText: string, displayTextLeft: string, displayTextRight: string, splitText: boolean }>;
  private view: string;
  private itemPopularity: any = {};
  private dataArray: Array<TableItem>;
  private dataArraySortedPopularity: Array<TableItem>;
  private currentSort: { type: string, asc: boolean };
  private filterOptions: Array<{ name: string, checked: boolean }> = [];
  private selectedItems: Array<number> = [];
  private customHiddenItems: Array<string> = [];
  private hiddenByColumnFilter: any = {};
  private sub: any;
  private pageText: any = {};
  private itemCount: number;
  private filteredColumns: any = {};
  private translatedItems: any = {};
  private translatedSelections: any = {};
  private tableView: { selection: string, items: string };
  private currentSessionFilters: SessionFilters;
  private tabs: Array<PulloutTab> = [];
  private hidingUnpopular: boolean;
  private images: Array<string> = [];
  private imageCount: number = 2;

  

  constructor(private navigateService: NavigateService, private dataService: DataService, private apiService: ApiService, 
    private dialogService: DialogService, private route: ActivatedRoute, private textService: TextService, private location: Location) { }

  public ngOnDestroy() {
    this.dataService.adDiv = document.body.lastElementChild;
    this.dataService.adDiv.setAttribute("hidden", "true");
  }
  
  public ngOnInit() {
    this.createTabs();
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Table of Health Effects',
      name: 'Benefits Matrix',
      footerMargin: false
    }
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        if (params['table']) {
          this.dataService.showGiahDarmani = true;
          this.apiService.get(AppSettings.API_ROUTES.AD_PAGES + '?name=' + params['table'], true)
            .subscribe(
              data => { console.log(data); this.loadPresetTable(data) },
              error => {
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
              }
            );
        } else {
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
        }
      });
    
  }
  
  private initNoParams() {
    //check if it's a custom MyChart
    if (this.dataService.selectedChart && this.dataService.selectedChart.selected) {
      this.init();
      this.view = this.dataService.selectedChart.view;
      this.selected = this.dataService.selectedChart.selected;
      sessionStorage.setItem('view', this.view);
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
      { name: 'Negative Effect', checked: false },
      { name: 'Less Popular Items', checked: false },
    ];
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error)
    );
    this.tableView = {
      selection: this.view,
      items: this.view === 'food' ? 'condition' : 'food'
    };
  };

  private setTranslations(data: any) {
    this.pageText.emphasized = data["emphasized"] || "Emphasized";
    this.pageText.beneficial = data["benefits"] || "Benefits";
    this.pageText.assists = data["assists"] || "Assists";
    this.pageText.mixed = data["mixed_effects"] || "Mixed";
    this.pageText.inhibits = data["inhibits"] || "Inhibits";
    this.pageText.negative = data["side_effect"] || "Side Effect";
    this.pageText.helperTitle1 = data["table_help_title_1"] || "Details?";
    this.pageText.helperTitle2 = data["table_help_title_2"] || "References?";
    this.pageText.helperText = data["table_help_text"] || "Click on Green or Red Symbols";
    this.pageText.seeMore = data["table_see_more"] || "Click to see more...";
    this.pageText.seeLess = data["table_see_less"] || "Click to see less...";
    this.dataService.page.text = data["effects_table"] || "Table of Health Effects";
  }

  private initServiceCall = function () {
    // if only 1 column, load images
    if (this.selected.length === 1) {
      for (var i = 0; i < this.imageCount; i++) {
        this.images.push("https://health-foods-matrix.s3.us-west-2.amazonaws.com/images/" + this.selected + "-" + (i + 1) + ".jpg");
      }
    }
    let query: string = '';
    if (this.view === 'food') {
      query = 'foods=' + encodeURIComponent(this.selected.join());
    } else if (this.view === 'condition') {
      query = 'conditions=' + encodeURIComponent(this.selected.join());
    }

    this.textService.getTranslation(this.tableView.selection).subscribe(translatedSelections => {
      this.translatedSelections = translatedSelections;
      this.textService.getTranslation(this.tableView.items).subscribe(translatedItems => {
        this.translatedItems = translatedItems;
        this.apiService.get(AppSettings.API_ROUTES.COMPACT + '?' + query, true)
        .subscribe(data => this.processData(data),
          error => console.error('Error getting all items: ' + error)
        );
      });
    });
    this.loadAd();
  }  

  private loadPresetTable(data: PresetTable) {
    // validate table
    if (!data.type || data.items.length < 1) {
      this.initNoParams();
    } else {
      if (AppSettings.LANGUAGE_CODE_MAP[data.language.toLowerCase()]) {
        this.textService.language = data.language;
        if (data.language.toLowerCase() === "persian") {
          this.dataService.showAd = true;
        }
      } 
      this.view = data.type.toLowerCase();
      this.selected = data.items;
      sessionStorage.setItem('view', this.view);
      sessionStorage.setItem('selected', JSON.stringify(this.selected));
      sessionStorage.setItem('selected' + this.view, JSON.stringify(this.selected));
      this.location.go("/benefits");
      this.initNoParams();
    }
  }

  private processData(data: Array<any>) {
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

    //get session filter and sort data
    let sessionFilterString: string = sessionStorage.getItem('currentFilter');
    this.currentSessionFilters = (sessionFilterString) ? JSON.parse(sessionFilterString) : {};
    this.currentSessionFilters.hidden = this.currentSessionFilters.hidden || [];
    this.currentSessionFilters.filters = this.currentSessionFilters.filters || [5]; // default filter to 5 (hide unpopular)   
    this.currentSessionFilters.columns = this.currentSessionFilters.columns || [];    
    this.customHiddenItems = this.currentSessionFilters.hidden;
    
    for (let item in dataHash) {
      let hidden = false;
      let hiddenIndex = this.currentSessionFilters.hidden.indexOf(item);
      if (hiddenIndex > -1) {
        hidden = true;
      }
      this.dataArray.push({ item: item, displayText: this.translatedItems[item.toLowerCase()] || item, values: dataHash[item], hidden: hidden, selected: false});
    }
    // if conditions view (so data items are foods)
    if (this.view === "condition") {
      let warningQuery = 'foods=';
      this.apiService.get(AppSettings.API_ROUTES.WARNINGS + '?' + warningQuery, true)
        .subscribe(
          data => this.processWarningsData(data),
          error => console.error('Error getting warnings data: ' + error)
        );
    }
    this.hideUnpopularThreshold = this.dataArray.length <= 100 ? 10 : this.dataArray.length * 0.10;
    this.dataArraySortedPopularity = Object.assign([], this.dataArray);
    this.dataArraySortedPopularity.sort(this.popularitySort(1));

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
      this.sort('popularity');
    }  

    this.hidingUnpopular = this.currentSessionFilters.filters.indexOf(5) > -1;
  }

  private processSelected() {
    this.selectedHeadings = [];
    let center = this.textService.rightJustify ? 18 : 15;
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

  private processWarningsData(data) {
    for (let item of this.dataArray) {
      item.hasWarning = data[item.item];
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

    // if (this.selected.length > 1) {
    //   let numbers: string[] = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    //   className += ' ' + numbers[this.selected.length] + '-col';
    // }
    className += ' ' + "six-col";
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
        this.currentSort.type = 'popularity';
        this.dataArray.sort(this.popularitySort(orderFactor));
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

  private onFilterChange(index: number, newValue: boolean): void {
    this.resetSelection();
    this.filterOptions[index].checked = newValue;
    let beneficial: boolean = this.filterOptions[0].checked;
    let assist: boolean = this.filterOptions[1].checked;
    let mixed: boolean = this.filterOptions[2].checked;
    let inhibits: boolean = this.filterOptions[3].checked;
    let negative: boolean = this.filterOptions[4].checked;
    let unpopular: boolean = this.filterOptions[5].checked;
    this.hidingUnpopular = unpopular;

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
            (negative && itemVal === -1) ||
            (unpopular && this.shouldHideUnpopular(item))) {
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

  private shouldHideUnpopular(tableItem: TableItem): boolean {
    //HACK - using duplicated array, find a better way
    // if table length < 100, show 20 items (or all items if less than 20)
    // otherwise only return top 20% popular items
    for (let i = 0; i < this.hideUnpopularThreshold; i++) {
      if (this.dataArraySortedPopularity[i].item == tableItem.item) {
        return false;
      }
    }

    return true;
  };

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

  private toggleSeeMore() {
    this.hidingUnpopular = !this.hidingUnpopular;
    this.onFilterChange(5, this.hidingUnpopular);
  }

  private createTabs(): void {
    let tabNames: Array<string> = [
      "Help", "Sort", "Filter", "Save", "Icons", "Translate"
    ];
    let tabHeight: number = 1. / tabNames.length * 85;

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
    if (tab.name === "Translate") {
      this.navigateService.navigateTo('language');
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

  private loadAd(): void {
    // if (this.dataService.adDiv) {
    //   this.dataService.adDiv.removeAttribute("hidden");
    //   return;
    // }
    
    // if (this.dataService.showAd) {
    //   var slotDom: Element = document.getElementById("ad-slot");
    //   for (var keys = Object.keys(window["clickyab_ad"]), i = 0; i < keys.length; i++) {
    //     window["clickyab_ad"][keys[i]] && slotDom.setAttribute("clickyab-" + keys[i], window["clickyab_ad"][keys[i]]);
    //   }
    //   // window["addEventListener("DOMContentLoaded", function() {
    //   window["totalOfClickyabShowAd"] = window["totalOfClickyabShowAd"] || 1;
    //   window["countOfClickyabShowAd"] = window["countOfClickyabShowAd"] ? window["countOfClickyabShowAd"] + 1 : 1;
    //   window["totalOfClickyabShowAd"] === window["countOfClickyabShowAd"] && (i = 0);
    //   window["clickyabParams"] = {
    //     id: window["clickyab_ad"].id,
    //     domain: window["clickyab_ad"].domain
    //   };
    //   if (!document.getElementById("clickyab-show-js-v2")) {
    //     window["injectClickyabMultiJs"] = !0;
    //     var s = document.createElement("script");
    //     s.async = true;
    //     s.type = "text/javascript";
    //     s.id = "clickyab-show-js-v2";
    //     s.src = "//supplier.clickyab.com/api/multi.js";
    //     document.body.appendChild(s);
    //   }
    //   // }, !1),
    // }
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

export interface TableItem {
  item: string,
  displayText: string,
  values: Array<{
    effect: string,
    top: string,
  }>,
  hidden: boolean,
  selected: boolean,
  showEnglish?: boolean,
  hasWarning?: boolean
}

export interface SessionFilters {
  hidden: Array<any>;
  filters: Array<any>;
  columns: Array<any>;
}

export interface PresetTable {
  name: string;
  language: string;
  type: string;
  items: Array<string>;
}