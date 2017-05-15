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
import { KeysPipe, DataService } from '../common';

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

  constructor(private http: Http, private router: Router, private dataService: DataService, private route: ActivatedRoute) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = 'Warnings';
    this.dataService.currentPageText = 'Warnings';
    //get state of this page
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.item = params['food'] || '';
        if (!this.item) {
          this.router.navigateByUrl('home');
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
    this.http.get(AppSettings.API_ENDPOINT + 'getWarnings?' + warningQuery)
      .map(res => { return res.json() })
      .catch(this.handleError)
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
    console.log(this.warningsObject);
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
