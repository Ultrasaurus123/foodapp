import {
  Component,
  OnInit
} from '@angular/core';
import { DataService, NavigateService } from '../common';
import { AppSettings } from '../app.module';

@Component({
  selector: 'agreement',
  styleUrls: ['./agreement.component.scss'],
  templateUrl: './agreement.component.html'
})
export class AgreementComponent implements OnInit {
  private appName: string;
  private websiteName: string;

  constructor(private navigateService: NavigateService, private dataService: DataService) { }
  
  public ngOnInit() {
    this.websiteName = AppSettings.APP_NAME.replace(/ /g, '');
    this.appName = AppSettings.APP_NAME;
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Terms and Conditions',
      name: 'Disclaimer',
      footerMargin: false
    }
    let agreement = localStorage.getItem('agreement');
    this.dataService.agreement = agreement === 'true';
  }

  private clickAgree() {
    localStorage.setItem('agreement', 'true');
    this.dataService.agreement = true;
    this.navigateService.navigateTo(this.dataService.disclaimerRedirectUrl);
  }
}
