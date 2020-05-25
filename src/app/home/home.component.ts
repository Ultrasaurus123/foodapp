import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Location } from '@angular/common';
import { DataService, TextService, NavigateService, ApiService } from '../common';
import { AppSettings } from '..';

@Component({
  selector: 'home',  // <home></home>
  providers: [DataService],
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private pageText: any = {};
  private translations: any;
  private currentLanguageCode: string;
  private examplesLink: string;
  private guideLink: string;
  private bgColor: string;

  constructor(private dataService: DataService, private route: ActivatedRoute, private location: Location,
    private textService: TextService, private navigateService: NavigateService, private apiService: ApiService) { }

  public ngOnInit() {
    this.dataService.page = {
      text: 'Home',
      name: 'Home',
      hideFooter: true,
    };
    window.scrollTo(0, 0);
    this.dataService.loadFoodsAndConditions();
    this.examplesLink = AppSettings.EXAMPLES_LINK;
    this.guideLink = AppSettings.GUIDE_LINK
    this.route.queryParams.subscribe(data => {
      var reload: boolean = false;
      if (data && data["reftag"]) {
        this.apiService.post(AppSettings.API_ROUTES.EMIT_EVENT, { e: "Referral", d: data["reftag"] }).subscribe();
        reload = true;
      }
      if (data && data["language"] && data["language"].toLowerCase() === "persian") {
        this.textService.language = 'Persian';
        this.dataService.showAd = true;
        reload = true;
      }
      if (reload) {
        this.location.go("/home");
      }
    });
    this.currentLanguageCode = AppSettings.LANGUAGE_CODE_MAP[this.textService.language.toLowerCase()].toUpperCase();
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error)
    );
}

  public ngOnDestroy() {
    document.body.style.background = this.bgColor;
  }

  private setTranslations(data: any) {
    // HACK for background styling once loaded
    this.bgColor = document.body.style.background;
    document.body.style.background = "#4c7c73";
    this.pageText.headline = AppSettings.APP_NAME;
    this.pageText.pageInfo = data["description"] || "Foods & Remedies for Multiple Health Concerns";  
    this.pageText.getStarted = 'It also compares benefits & side effects of multiple sets of foods and home remedies.';
    this.pageText.helpLink = data["guide"] || "User's Guide";
    this.pageText.examplesLink = data["examples"] || 'Examples';
    this.pageText.foodButton = data["foods_button"] || 'Foods / Remedies';
    this.pageText.healthButton = data["health_button"] || 'Health Concerns';
    this.pageText.topConcernsLink = data["top_20_concerns_link"] || 'Top 20 Concerns';
    this.pageText.topFoodsLink = data["top_20_foods_link"] || 'Top 20 Foods';
    this.dataService.page.text = data["menu_home"] || this.dataService.page.text;
  }

  private showItemList(type) {
    sessionStorage.setItem('view', type);
    this.navigateService.navigateTo('search');
  }

  private clickHomeImage() {
    this.navigateService.navigateTo('about');
  }
}
