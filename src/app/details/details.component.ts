import {
  Component,
  OnInit
} from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { ApiService, KeysPipe, DataService, NavigateService } from '../common';

@Component({
  selector: 'benefit-details',
  styleUrls: ['./details.component.scss'],
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  private detailItem: string;
  private selectedItem: string;
  private selectedItems: Array<string>;
  private detailIndex: number;
  private selectedIndex: number;
  private suffixIndex: number;
  private view: string;
  private dataArray: Array<any>;
  private images: Array<any> = [];
  private pageHeader: string;
  private dataObject: any = {};
  private warningsObject: any = {};
  private sideEffectsList: Array<string> = [];
  private maxSelection: number = AppSettings.MAX_SELECTIONS;

  constructor(private apiService: ApiService, private navigateService: NavigateService, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Explanation of Effects',
      name: 'Details'
    };
    //get state of this page
    this.view = sessionStorage.getItem('view');
    this.detailIndex = (this.view === 'food') ? 1 : 0;
    this.selectedIndex = (this.view === 'food') ? 0 : 1;
    this.suffixIndex = (this.view === 'food') ? 6 : 5;
    let detailsString: string = sessionStorage.getItem('details');
    let details: any = JSON.parse(detailsString);
    this.detailItem = (this.view === 'condition') ? details.food : details.condition;
    this.selectedItem = (this.view === 'condition') ? details.condition : details.food;
    let selectedString: string = sessionStorage.getItem('selected' + this.view);
    this.selectedItems = JSON.parse(selectedString);


    if (!this.detailItem || !this.view || !this.selectedItems) {
      this.navigateService.navigateTo('benefits');
    } else {
      this.pageHeader = (this.view === 'food') ? 'Diet for ' : 'Health effects of ';
      this.pageHeader += this.detailItem;
      this.init();
    }
  }

  private init = function () {
    let query = '';
    // Get details for all items, not just specific selected one
    // if (this.view === 'food') {
    //   query = 'foods=' + encodeURIComponent(this.selectedItems.join()) + '&conditions=' + encodeURIComponent(this.detailItem);
    // } else if (this.view === 'condition') {
    //   query = 'foods=' + encodeURIComponent(this.detailItem) + '&conditions=' + encodeURIComponent(this.selectedItems.join());
    // }
    if (this.view === 'food') {
      query = 'foods=' + encodeURIComponent(this.selectedItem) + '&conditions=' + encodeURIComponent(this.detailItem);
    } else if (this.view === 'condition') {
      query = 'foods=' + encodeURIComponent(this.detailItem) + '&conditions=' + encodeURIComponent(this.selectedItem);
    }

    this.apiService.get(AppSettings.API_ROUTES.ALL_DATA + '?' + query, true)
      .subscribe(data => this.processData(data),
      error => console.error('Error getting cross reference data: ' + error)
    );
    
    let warningQuery = 'foods=';
    warningQuery += (this.view === 'food') ? encodeURIComponent(this.selectedItems.join()) : encodeURIComponent(this.detailItem);
    this.apiService.get(AppSettings.API_ROUTES.WARNINGS + '?' + warningQuery, true)
      .subscribe(data => this.processWarningsData(data),
      error => console.error('Error getting warnings data: ' + error)
      );

    if (this.view === 'condition') {
      let sideEffectsQuery = 'food=';
      sideEffectsQuery += encodeURIComponent(this.detailItem);
      this.apiService.get(AppSettings.API_ROUTES.SIDE_EFECTS + '?' + sideEffectsQuery, true)
        .subscribe(data => this.sideEffectsList = data,
        error => console.error('Error getting side effects data: ' + error)
        );
    }
  };

  private processData(data: Array<any>) {
    this.dataArray = [];
    for (let i = 1; i < data.length; i++) {
      this.dataObject[data[i][this.selectedIndex]] = this.dataObject[data[i][this.selectedIndex]] || [];
      this.dataObject[data[i][this.selectedIndex]].push(data[i]);
    }
    let keys = Object.keys(this.dataObject);
    for (let k = 0; k < keys.length; k++) {
      this.dataArray.push(this.dataObject[keys[k]]);
    }
    console.log(this.dataArray);
    this.getImages();
  }
  
  private processWarningsData(data: any) {
    this.warningsObject = data;
  }

  private getImages() {
    // GOOGLE IMAGE API

    let imageQuery = this.detailItem;
    if (this.dataArray.length > 0 && this.dataArray[0].length > 0 && this.dataArray[0][0][this.suffixIndex]) {
      imageQuery += ' ' + this.dataArray[0][0][this.suffixIndex];
    }
    this.apiService.getExternal('https://www.googleapis.com/customsearch/v1?key=AIzaSyANob8Nzzo_KhTLJSSQOm8XusU9uUBPsVc&cx=018410904851487458112:gwczc-vwosw&searchType=image&num=4&safe=high&fields=items(image)&q=' + imageQuery)
      .subscribe(res => this.images = res.items,
      error => console.error('Error getting cross reference data: ' + error)
      );
  }

  private getImageSearchURL() {
    return 'https://www.google.com/search?safe=active&q=' + encodeURIComponent(this.detailItem);
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

  private addConditionToList(condition: string) {
    let conditionIndex = this.selectedItems.indexOf(condition);
    if (conditionIndex > -1) {
      this.selectedItems.splice(conditionIndex, 1);
      sessionStorage.setItem('selectedcondition', JSON.stringify(this.selectedItems));  
    } else if (this.selectedItems.length < AppSettings.MAX_SELECTIONS) {
      this.selectedItems.push(condition);
      sessionStorage.setItem('selectedcondition', JSON.stringify(this.selectedItems));  
    }
  }
}
