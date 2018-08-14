import {
  Component,
  OnInit
} from '@angular/core';
import { DataService } from '../common';
import { Router } from '@angular/router';
import { AppSettings } from '..';

@Component({
  selector: 'privacy-policy',
  styleUrls: ['./privacy-policy.component.scss'],
  templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {
  private appName: string;
  private websiteName: string;
  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    this.websiteName = AppSettings.APP_NAME.replace(/ /g, '');
    this.appName = AppSettings.APP_NAME;
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Privacy Policy',
      name: 'Privacy'
    };
  }
}
