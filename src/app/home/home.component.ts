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
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [DataService],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./home.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
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
    this.pageText.headline = 'Welcome to ' + AppSettings.APP_NAME;
    this.pageText.pageInfo = AppSettings.APP_NAME +
      ` compares foods for your unique set of multiple health concerns
      It also compares benefits & side effects of multiple sets of foods and home remedies.`;  
    this.pageText.helpLink = 'Click here for a quick guide on using this application';
    this.pageText.getStarted = 'Alternatively, you may search for the benefits and side effects of your favorite foods or remedies:';
    this.dataService.loadFoods();
    this.dataService.loadConditions();
  }

  private showItemList(type) {
    sessionStorage.setItem('view', type);
    this.navigateService.navigateTo('search');
  }
}
