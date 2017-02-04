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
import { KeysPipe, DataService } from '../common';

@Component({
  selector: 'benefit-details',
  styleUrls: ['./details.component.scss'],
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  private detailItem: string;
  private selectedItems: Array<string>;
  private detailIndex: number;
  private selectedIndex: number;
  private view: string;
  private dataArray: Array<any>;
  private images: Array<any> = [];
  private pageHeader: string;
  private dataObject: any = {};

  constructor(private http: Http, private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = 'Effect Information';
    //get state of this page
    this.view = sessionStorage.getItem('view');
    this.detailIndex = (this.view === 'food') ? 1 : 0;
    this.selectedIndex = (this.view === 'food') ? 0 : 1;
    let detailsString: string = sessionStorage.getItem('details');
    let details: any = JSON.parse(detailsString);
    this.detailItem = (this.view === 'condition') ? details.food : details.condition;
    let selectedString: string = sessionStorage.getItem('selected');
    this.selectedItems = JSON.parse(selectedString);


    if (!this.detailItem || !this.view || !this.selectedItems) {
      this.router.navigateByUrl('benefits');
    } else {
      this.pageHeader = (this.view === 'food') ? 'Diet for ' : 'Health effects of ';
      this.pageHeader += this.detailItem;
      this.init();
    }
  }

  private init = function () {

    // GOOGLE IMAGE API
    let imageQuery = this.detailItem;
    this.http.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyANob8Nzzo_KhTLJSSQOm8XusU9uUBPsVc&cx=018410904851487458112:gwczc-vwosw&searchType=image&num=8&safe=high&fields=items(image)&q=' + imageQuery)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(res => this.images = res.items,
      error => console.error('Error getting cross reference data: ' + error)
      );

    let query = '';
    if (this.view === 'food') {
      query = 'foods=' + this.selectedItems.join() + '&conditions=' + this.detailItem;
    } else if (this.view === 'condition') {
      query = 'foods=' + this.detailItem + '&conditions=' + this.selectedItems.join();
    }
    this.http.get(AppSettings.API_ENDPOINT + 'getData?' + query)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(data => this.processData(data),
      error => console.error('Error getting cross reference data: ' + error)
      );
  };

  private processData(data: Array<any>) {
    this.dataArray = [];
    data = data.slice(1);
    for (let i = 0; i < data.length; i++) {
      this.dataObject[data[i][this.selectedIndex]] = this.dataObject[data[i][this.selectedIndex]] || [];
      this.dataObject[data[i][this.selectedIndex]].push(data[i]);
    }
    let keys = Object.keys(this.dataObject);
    for (let k = 0; k < keys.length; k++) {
      this.dataArray.push(this.dataObject[keys[k]]);
    }
    console.log(this.dataArray);
  }

  private getIcon = function (benefit: string): string {
    let icon = '../../assets/img/';
    if (benefit === '1') {
      icon += 'beneficial.png';
    } else if (benefit === '-1') {
      icon += 'negative.png';
    } else if (benefit === '2') {
      icon += 'assist.png';
    } else if (benefit === '-2') {
      icon += 'inhibit.png';
    } else if (benefit === '0') {
      icon += 'mixed.png';
    }
    return icon;
  };

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
