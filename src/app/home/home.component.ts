import {
  Component,
  OnInit
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { DataService, TextService, NavigateService } from '../common';
import { AppSettings } from '..';

@Component({
  selector: 'home',  // <home></home>
  providers: [DataService],
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private allFoods: Array<any>;
  private allConditions: Array<any>;
  private itemSet: Array<any>;
  private showFood: boolean = false;
  private showCondition: boolean = false;
  private checkedFoods: number = 0;
  private checkedConditions: number = 0;
  private searchModel: string = '';
  private maxSelections: number = AppSettings.MAX_SELECTIONS;
  private started: boolean = false;
  private pageText: any = {};

  constructor(private http: Http, private router: Router, private dataService: DataService, private route: ActivatedRoute,
    private textService: TextService, private navigateService: NavigateService) { }

  public ngOnInit() {
    this.navigateService.getRouteData(this.route).subscribe(data => {});
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Home',
      name: 'Home'
    };
    this.pageText.headline = AppSettings.APP_NAME;
    this.pageText.pageInfo = "Foods & Remedies for Multiple Health Concerns";  
    this.pageText.getStarted = 'It also compares benefits & side effects of multiple sets of foods and home remedies.';
    this.pageText.helpLink = "User's Guide";
    this.pageText.examplesLink = 'Examples';
    this.dataService.loadFoods();
    this.dataService.loadConditions();
  }

  private showItemList(type) {
    sessionStorage.setItem('view', type);
    this.navigateService.navigateTo('search');
  }
}
