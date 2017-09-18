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
import { ApiService, KeysPipe, DataService, NavigateService } from '../common';

@Component({
  selector: 'warnings-details',
  styleUrls: ['./warnings.component.scss'],
  templateUrl: './warnings.component.html'
})
export class WarningsComponent implements OnInit {
  private item: string;
  private selectedItems: Array<string>;
  private detailIndex: number;
  private selectedIndex: number;
  private view: string;
  private dataArray: Array<any>;
  private images: Array<any> = [];
  private pageHeader: string;
  private dataObject: any = {};
  private warningsObject: any = {};
  private sub: any;

  constructor(private apiService: ApiService, private navigateService: NavigateService, private dataService: DataService, private route: ActivatedRoute) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Warnings',
      name: 'Warnings'
    };
    //get state of this page
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.item = params['food'] || '';
        if (!this.item) {
          this.navigateService.navigateTo('home');
        }
      });
      this.pageHeader = 'Warnings about ' + this.item;
      this.init();
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private init = function () {
    let warningQuery = 'foods=';
    warningQuery += encodeURIComponent(this.item);
    this.apiService.get('getWarnings?' + warningQuery, true)
      .subscribe(data => this.processWarningsData(data),
      error => console.error('Error getting warnings data: ' + error)
      );
  };
  
 private processWarningsData(data: Array<any>) {
    // skip headings
    for (let i = 1; i < data.length; i++) {
      let item = data[i][0].toLowerCase();
      this.warningsObject[item] = this.warningsObject[item] || { warnings: [], sources: [] };
      this.warningsObject[item].warnings.push(data[i][1]);
      this.warningsObject[item].sources.push(data[i][2]);
    }
  }
}
