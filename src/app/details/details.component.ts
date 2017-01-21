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

@Component({
  selector: 'benefit-details',
  styleUrls: ['./details.component.scss'],
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  private food: string;
  private condition: string;
  private headings: string;
  private dataArray: Array<any>;
  private images: Array<any> = [];

  constructor(private http: Http, private router: Router) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    //get state of this page
    let detailsString: string = sessionStorage.getItem('details');
    let details: any = JSON.parse(detailsString);
    this.food = details.food;
    this.condition = details.condition;

    if (!this.food || !this.condition) {
      this.router.navigateByUrl('benefits');
    } else {
      this.init();
    }
  }

  private init = function () {

    // GOOGLE IMAGE API
    let food = 'food+' + this.food;
    this.http.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyANob8Nzzo_KhTLJSSQOm8XusU9uUBPsVc&cx=018410904851487458112:gwczc-vwosw&searchType=image&num=8&safe=high&fields=items(image)&q=' + food)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(res => this.images = res.items,
      error => console.error('Error getting cross reference data: ' + error)
      );

    let query = 'foods=' + this.food + '&conditions=' + this.condition;
    this.http.get(AppSettings.API_ENDPOINT + 'getData?' + query)
      .map(res => { return res.json() })
      .catch(this.handleError)
      .subscribe(data => this.processData(data),
      error => console.error('Error getting cross reference data: ' + error)
      );
  };

  private processData(data: Array<any>) {
    this.headings = data[0];
    this.dataArray = data.slice(1);
  }

  private clickColumn(row: any, index: number) {
    // for link, open in new window/tab
    if (index === 4) {
      window.open(row[index], '_blank');
    }
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
