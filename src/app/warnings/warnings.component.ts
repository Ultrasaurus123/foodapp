import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppSettings } from '..';
import { ApiService, DataService, NavigateService, TextService } from '../common';

@Component({
  selector: 'warnings-details',
  styleUrls: ['./warnings.component.scss'],
  templateUrl: './warnings.component.html'
})
export class WarningsComponent implements OnInit {
  private item: string;
  private pageHeader: string;
  private warningsObject: any = {};
  private pageText: any = {};
  private sub: any;

  constructor(private textService: TextService, private navigateService: NavigateService, private dataService: DataService,
    private apiService: ApiService, private route: ActivatedRoute) { }

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
        this.pageHeader = 'Warnings about ' + this.item;
        this.init();
        });
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private init = function () {
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error));
    let warningQuery = 'foods=';
    warningQuery += encodeURIComponent(this.item);
    this.apiService.get(AppSettings.API_ROUTES.WARNINGS + '?' + warningQuery, true)
      .subscribe(data => this.processWarningsData(data),
      error => console.error('Error getting warnings data: ' + error)
      );
  };

  private setTranslations(data: any) {
    this.pageText['translate'] = data["translate"] || "TRANSLATE";
    this.dataService.page.text = data["menu_warnings"] || this.dataService.page.text;
  }
  
  private processWarningsData(data: any) {
    this.warningsObject = data;
  }

  private getTranslateLink(description: string) {
    let url: string = "https://translate.google.com/#auto/"
      + AppSettings.LANGUAGE_CODE_MAP[this.textService.language.toLowerCase()]
      + "/"
      + description;
    return url;
  }
}
