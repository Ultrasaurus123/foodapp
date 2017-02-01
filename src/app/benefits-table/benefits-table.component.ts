import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { DataService } from '../common';

@Component({
  selector: 'benefits-table',
  styleUrls: ['./benefits-table.component.scss'],
  templateUrl: './benefits-table.component.html'
})
export class BenefitsTableComponent implements OnInit {
  private selected: Array<string>;
  private view: string;
  private heading: string;
  private dataArray: Array<any>;
  private currentSort: { type: string, asc: boolean };
  private filterOptions: Array<{ name: string, checked: boolean }> = [];
  private selectedItems: Array<number> = [];
  private customHiddenItems: Array<number> = [];

  constructor(private http: Http, private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = 'Benefits Table';
    //get state of this page
    let selectedString: string = sessionStorage.getItem('selected');
    this.selected = JSON.parse(selectedString);
    this.view = sessionStorage.getItem('view');

    if (!this.selected || !this.view) {
      this.router.navigateByUrl('home');
    } else {
      this.init();
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

    let query = '';
    if (this.view === 'food') {
      query = 'foods=' + this.selected.join();
    } else if (this.view === 'condition') {
      query = 'conditions=' + this.selected.join();
    }

    this.http.get(AppSettings.API_ENDPOINT + 'getCompactData?' + query)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(data => this.processData(data),
      error => console.error('Error getting all conditions: ' + error)
      );
  };

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

  private processData(data: Array<any>) {
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
    for (let item in dataHash) {
      this.dataArray.push({ item: item, values: dataHash[item] });
    }
    // this.dataArray = this.dataArray;
    this.sort('az');
  }

  private selectItem(item: any, index: number) {
    item.selected = !item.selected;

    if (item.selected) {
      this.selectedItems.push(index);
    } else {
      let i = this.selectedItems.indexOf(index);
      this.selectedItems.splice(i, 1);
    }

    console.log(this.selectedItems);
  }

  private resetSelection() {
    for (let i of this.selectedItems) {
      this.dataArray[i].selected = false;
    }
    this.selectedItems = [];
  }

  private removeRows() {
    for (let i of this.selectedItems) {
      this.dataArray[i].selected = false;
      this.dataArray[i].hidden = true;
      this.customHiddenItems.push(i);
    }
    this.selectedItems = [];
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
  }


  private getSortOrderIcon = function (sortType): string {
    if (this.currentSort.type === sortType) {
      if (this.currentSort.asc) {
        return '&#8593;';
      } else {
        return '&#8595;';
      }
    }
    return '';
  };

  private sort(sortType: string) {
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
        if (Number(a.values[item]) !== NaN) {
          aCount += Number(a.values[item]);
        }
      }
      for (let item in b.values) {
        if (Number(b.values[item]) !== NaN) {
          bCount += Number(b.values[item]);
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
          if (Number(a.values[item]) !== NaN) {
            aCount += Number(a.values[item]);
          }
        }
        for (let item in b.values) {
          if (Number(b.values[item]) !== NaN) {
            bCount += Number(b.values[item]);
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
    }
  }

  private saveChart() {
    let c: string = localStorage.getItem('myCharts');
    let charts: Array<any> = [];
    if (c) {
      charts = JSON.parse(c);
    }
    let chartData = {
      name: 'my chart ' + (charts.length + 1),
      dataArray: this.dataArray.filter(item => { return !item.hidden }),
      selected: this.selected
    };
    charts.push(chartData);
    localStorage.setItem('myCharts', JSON.stringify(charts));
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
