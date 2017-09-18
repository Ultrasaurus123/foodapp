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
  selector: 'page-header',
  styleUrls: ['./page-header.component.scss'],
  templateUrl: './page-header.component.html'
})

export class PageHeaderComponent implements OnInit {

  public menuOpen: boolean = false;
  public menuItems: Array<{ name: string, display: string, link: string, data?: any }>;

  private displays: Array<string>;
  private footerMargin: boolean;
  private menuTitle: string;
  private myChartsActive: boolean;
  private self: any;

  constructor(private navigateService: NavigateService, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
    this.displays = this.menuItems.map(elem => { return elem.display; });   
    this.updateMenuItems();
  }

  public updateMenuItems() {
  }

  public ngDoCheck() {
    // if (this.textService.languageChanged) {
    //   this.updateMenuItems();
    //   this.textService.languageChanged = false;
    // } 
    this.footerMargin = (this.dataService.page) ? this.dataService.page.footerMargin : false;
    this.menuTitle = (this.dataService.page) ? this.dataService.page.text : '';
    let myCharts = localStorage.getItem('myCharts');
    if (myCharts) {
      this.dataService.myCharts = JSON.parse(myCharts);
      this.myChartsActive = this.dataService.myCharts && this.dataService.myCharts.length > 0;
    }  
  }

  public toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  public clickMenuLink(menuItem: { name: string, link: string, data?: any }) {
    this.menuOpen = false;
    if (menuItem.name === 'Feedback') {
      window.location.href = 'mailto:contact@healthfoodsmatrix.com';
    } else if (menuItem.name === 'Facebook') {
      window.open(AppSettings.FACEBOOK_LINK, '_blank');  
    } else if (menuItem.name !== 'My Charts' || this.myChartsActive) {
      this.menuOpen = false;
      // this.router.navigate([menuItem.link, menuItem.data || {}]);
      this.navigateService.navigateTo(menuItem.link, menuItem.data);      
    }  
  }

  private getMenuTitle() {
    return this.menuTitle + (this.textService.language !== 'English' ? ' (' + this.textService.language +')' : '');
  }

}