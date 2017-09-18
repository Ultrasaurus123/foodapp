import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TextService } from '../../services/text.service';
import { NavigateService } from '../../services/navigate.service';
import { AppSettings } from '../../../';

@Component({
  selector: 'page-footer',
  styleUrls: ['./page-footer.component.scss'],
  templateUrl: './page-footer.component.html'
})

export class PageFooterComponent implements OnInit {

  private appName: string = AppSettings.APP_NAME;
  private footerLinks: any = AppSettings.FOOTER_LINKS;
  private footerMargin: boolean;

  constructor(private navigateService: NavigateService, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
  }

  public ngDoCheck() {
    this.footerMargin = (this.dataService.page) ? this.dataService.page.footerMargin : false;
  }

  public clickFooterLink(link: string) {
    if (link === 'contact') {
      window.location.href = 'mailto:contact@healthfoodsmatrix.com';
    } else if (link === 'facebook') {
      window.open(AppSettings.FACEBOOK_LINK, '_blank');  
    } else {
      this.navigateService.navigateTo(link);
    }  
  }

}