import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { DataService, PromptModalComponent, Chart, TextService } from '../common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'benefits-table',
  styleUrls: ['./benefits-table.component.scss'],
  templateUrl: './benefits-table.component.html'
})
export class BenefitsTableComponent implements OnInit {
  private selected: Array<string>;
  private selectedHeadings: Array<string>;
  private view: string;
  private heading: string;
  private dataArray: Array<any>;
  private currentSort: { type: string, asc: boolean };
  private filterOptions: Array<{ name: string, checked: boolean }> = [];
  private selectedItems: Array<number> = [];
  private customHiddenItems: Array<number> = [];
  private sub: any;
  private itemCount: number;
  private filteredColumns: any = {};

  constructor(private http: Http, private router: Router, private dataService: DataService,
    private dialogService: DialogService, private route: ActivatedRoute, private textService: TextService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPageText = 'Benefits Matrix';
    this.dataService.currentPage = 'Benefits Matrix';
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
            this.router.navigateByUrl('home');
          }
        }
        this.initNoParams();
      });
  }
  
  private initNoParams() {
    //check if it's a custom MyChart
    if (this.dataService.selectedChart && this.dataService.selectedChart.selected) {
      this.init();
      this.view = this.dataService.selectedChart.view;
      this.selected = this.dataService.selectedChart.selected;
      this.dataArray = this.dataService.selectedChart.dataArray;
      this.dataService.selectedChart = null;
      if (!this.dataArray || this.dataArray.length === 0) {
        this.initServiceCall();
      }
    } else {
      //get state of this page
      this.view = sessionStorage.getItem('view');
      let selectedString: string = sessionStorage.getItem('selected' + this.view);
      this.selected = JSON.parse(selectedString);

      if (!this.selected || !this.view) {
        this.router.navigateByUrl('home');
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
    this.textService.getText(['Beneficial Effect','Assists','Mixed Effects','Inhibits','Negative Effect']).subscribe(
        text => {
          this.filterOptions = [
            { name: text[0], checked: false },
            { name: text[1], checked: false },
            { name: text[2], checked: false },
            { name: text[3], checked: false },
            { name: text[4], checked: false }
          ];
        }
    );
  };

  private initServiceCall = function () {
    let query = '';
    if (this.view === 'food') {
      query = 'foods=' + encodeURIComponent(this.selected.join());
    } else if (this.view === 'condition') {
      query = 'conditions=' + encodeURIComponent(this.selected.join());
    }

    this.http.get(AppSettings.API_ENDPOINT + 'getCompactData?' + query)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(data => this.processData(data),
      error => console.error('Error getting all conditions: ' + error)
      );

  }

  private processData(data: Array<any>, defaultSort: string) {
    this.processSelected();
    let hIndex: number = (this.view === 'food') ? 0 : 1;
    let dIndex: number = (this.view === 'food') ? 1 : 0;
    let dataHash = {};
    this.heading = data[0][hIndex];
    this.dataArray = [];
    for (let i = 1; i < data.length; i++) {
      dataHash[data[i][dIndex]] = dataHash[data[i][dIndex]] || {};
      dataHash[data[i][dIndex]][data[i][hIndex]] = data[i][2];
    }

    // convert hash to array so we can sort/filter/manipulate easier
    this.itemCount = Object.keys(dataHash).length;
    let itemIndex = 0;
    let sessionHidden: string = sessionStorage.getItem('hidden');
    let hiddenItems: Array<string> = (sessionHidden) ? JSON.parse(sessionHidden) : [];
    for (let item in dataHash) {
      this.textService.getText([item]).subscribe(
        text => {
          itemIndex++;
          let hidden = false;
          let hiddenIndex = hiddenItems.indexOf(item);
          if (hiddenIndex > -1) {
            hidden = true;
            hiddenItems.splice(hiddenIndex, 1);
          }
          this.dataArray.push({ item: text[0], values: dataHash[item], hidden: hidden });
          if (itemIndex === this.itemCount) {
            this.sort('effect');
          }
        }
      );
    }
  }

  private processSelected() {
    this.selectedHeadings = [];
    let center = 15;
    for (let s = 0; s < this.selected.length; s++) {
      this.textService.getText([this.selected[s]]).subscribe(
        text => {
          let selected = text[0];
          this.selectedHeadings.push(selected);
          if (selected.length > center) {
            let spaces = [], i = -1, closestToCenter = 0;
            while ((i = selected.indexOf(' ', i+1)) != -1) {
              spaces.push(i);
              closestToCenter = (Math.abs(center - i) < Math.abs(center - closestToCenter)) ? i : closestToCenter;
            }
            //if there are any spaces, break on space closest to center
            if (spaces.length > 0) {
              let left = selected.slice(0, closestToCenter);
              let right = selected.slice(closestToCenter + 1);
              this.selectedHeadings[s] = left + '<br>' + right;
            }
            //otherwise hyphenate
            else {

            }
          }
        }
      )
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

  private getTableHeadingClass = function (selectionHeading): string {
    let className: string = "table-headings";
    if (selectionHeading.indexOf('<br>') > -1) {
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
    let hiddenItems = [];
    for (let i of this.selectedItems) {
      this.dataArray[i].selected = false;
      this.dataArray[i].hidden = true;
      this.customHiddenItems.push(i);
      hiddenItems.push(this.dataArray[i].item);
    }
    this.selectedItems = [];
    sessionStorage.setItem('hidden', JSON.stringify(hiddenItems));
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
    sessionStorage.removeItem('hidden');
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
        
      case 'column':
        this.dataArray.sort(this.columnSort(orderFactor, column));
        break;
      default:
        break;
    }
  }

  private alphabeticSort(orderFactor: number): any {
    return function (a, b) {
      if (a.item.toLowerCase() < b.item.toLowerCase()) {
        return -1 * orderFactor;
      } else if (a.item.toLowerCase() > b.item.toLowerCase()) {
        return 1 * orderFactor;
      }
      return 0;
    }
  }

  private benefitSort(orderFactor: number): any {
    return function (a, b) {
      let aCount: number = 0, bCount: number = 0;
      for (let item in a.values) {
        if (Number(a.values[item]) !== NaN && Number(a.values[item]) !== 0) {
          aCount += (Number(a.values[item]) > 0) ? 1 : -1;
        }
      }
      for (let item in b.values) {
        if (Number(b.values[item]) !== NaN && Number(b.values[item]) !== 0) {
          bCount += (Number(b.values[item]) > 0) ? 1 : -1;
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
      let aKeys = Object.keys(a.values);
      let bKeys = Object.keys(b.values);

      if (aKeys.length > bKeys.length) {
        return -1 * orderFactor;
      } else if (aKeys.length < bKeys.length) {
        return 1 * orderFactor;
      } else {
        let aCount: number = 0, bCount: number = 0;
        for (let item in a.values) {
          if (Number(a.values[item]) !== NaN && Number(a.values[item]) !== 0) {
            aCount += (Number(a.values[item]) > 0) ? 1 : -1;
          }
        }
        for (let item in b.values) {
          if (Number(b.values[item]) !== NaN && Number(b.values[item]) !== 0) {
            bCount += (Number(b.values[item]) > 0) ? 1 : -1;
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

  private columnSort(orderFactor: number, column: string): any {
    orderFactor = 1;
    let columnName = column.replace('<br>', ' ');
    return function (a, b) {
      let aValue = a.values[columnName] || -3;
      let bValue = b.values[columnName] || -3;
      if (aValue > bValue) {
        return -1 * orderFactor;
      } else if (aValue < bValue) {
        return 1 * orderFactor;
      }
      return 0;
    }
  }

  private columnFilter(column: string): any {
    let columnName = column.replace('<br>', ' ');
    let indicesToHide = [];

    let itemsToHide = this.dataArray.filter((item, index) => {
      if (item.values[columnName] == undefined) {
        indicesToHide.push(index);
        return true;
      }
      return false;
    });

    for (let i of indicesToHide) {
      this.dataArray[i].selected = false;
      this.dataArray[i].hidden = true;
      this.customHiddenItems.push(i);
    }
    this.selectedItems = [];
    this.filteredColumns[column] = true;
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
        let itemVal = Number(item.values[value]);
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
      let sessionItems = sessionStorage.getItem('hidden');
      let hiddenItems: Array<string> = sessionItems ? JSON.parse(sessionItems) : [];
      if (matchCount === valuesCount) {
        item.hidden = true;
      } else {
        item.hidden = false;
        for (let i = 0; i < this.customHiddenItems.length; i++) {
          if (this.dataArray[this.customHiddenItems[i]] === item) {
            item.hidden = true;
            break;
          }
        }
      }
      let hiddenIndex: number = hiddenItems.indexOf(item.item);
      if (item.hidden && hiddenIndex === -1) {
        hiddenItems.push(item.item);
      } else if (!item.hidden && hiddenIndex > -1) {
        hiddenItems.splice(hiddenIndex, 1);
      }
      sessionStorage.setItem('hidden', JSON.stringify(hiddenItems));
    }
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
          for (let i = 0; i < this.dataArray.length; i++) {
            this.dataArray[i].selected = false;
          }
          let chartData = {
            name: message,
            dataArray: this.dataArray,
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
    this.router.navigateByUrl('details');
  }

  private goToHelp() {
    this.router.navigateByUrl('help');
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
