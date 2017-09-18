import {
  Component,
  OnInit
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { ApiService, DataService, PromptModalComponent, Chart } from '../common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'data-monitor',
  styleUrls: ['./data-monitor.component.scss'],
  templateUrl: './data-monitor.component.html'
})
export class DataMonitorComponent implements OnInit {
  private view: string;
  private dataArray: Array<any>;
  private effectCounts: Array<Array<number>>;
  private currentSort: { type: string, asc: boolean };

  constructor(private apiService: ApiService, private router: Router, private dataService: DataService,
    private dialogService: DialogService, private route: ActivatedRoute) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Data Monitor',
      name: 'Data Monitor'
    };
    this.init();
  }
  
  private init = function () {
    this.currentSort = {
      type: '',
      asc: true
    };
    this.initServiceCall('condition');
  };

  private initServiceCall = function (currentView: string, noSort: boolean) {
    this.view = (currentView === 'food') ? 'condition' : 'food';
    let query = this.view + '=' + (this.view === 'food') ? encodeURIComponent(this.dataService.allFoods.join())
      : encodeURIComponent(this.dataService.allConditions.join());

    this.apiService.get('getData?' + query)
      .subscribe(data => this.processData(data, this.view),
      error => console.error('Error getting all conditions: ' + error)
      );

  }

  private processData(data: Array<any>, item: string) {
    let itemIndex: number = (item === 'food') ? 0 : 2;
    let benefitIndex: number = 4;
    let dataHash = {};
    this.dataArray = [];
    for (let i = 1; i < data.length; i++) {
      dataHash[data[i][itemIndex]] = dataHash[data[i][itemIndex]] || {'2': 0, '1': 0, '0': 0, '-1': 0, '-2': 0};
      dataHash[data[i][itemIndex]][data[i][benefitIndex]]++;
    }

    // convert hash to array so we can sort/filter/manipulate easier
    for (let item in dataHash) {
      this.dataArray.push({ item: item, values: dataHash[item] });
    }
    this.currentSort.type = '';
    this.sort('benefit');
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

  private sort(sortType: string) {
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
}
