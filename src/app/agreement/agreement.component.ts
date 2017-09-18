import {
  Component,
  OnInit
} from '@angular/core';
import { DataService, NavigateService } from '../common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../common';

@Component({
  selector: 'agreement',
  styleUrls: ['./agreement.component.scss'],
  templateUrl: './agreement.component.html'
})
export class AgreementComponent implements OnInit {
  constructor(private navigateService: NavigateService, private dataService: DataService) { }

  public ngOnInit() {
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
