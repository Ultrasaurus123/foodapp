import {
  Component,
  OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from '../../services/data.service';
import { TextService } from '../../services/text.service';
import { NavigateService } from '../../services/navigate.service';
import { AppSettings } from '../../../';
import { MenuItem } from '../../interfaces/menu.interface';

@Component({
  selector: 'page-header',
  styleUrls: ['./page-header.component.scss'],
  templateUrl: './page-header.component.html'
})

export class PageHeaderComponent implements OnInit {

  public loadingMisc: boolean = false;
  public menuOpen: boolean = false;
  public menuItems: Array<MenuItem>;

  private displays: Array<string>;
  private footerMargin: boolean;
  private pageSubtitle: boolean;
  private menuTitle: string;
  private myChartsActive: boolean;
  private pageText: any = {};

  constructor(private location: Location, private navigateService: NavigateService, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error));
   
    this.displays = this.menuItems.map(elem => elem.display);   
  }

  public ngDoCheck() {
    if (!this.loadingMisc) {
      this.loadingMisc = true;
      this.textService.getMiscTranslations().subscribe(
        data => this.setTranslations(data),
        error => console.error('Error getting translations: ' + error)
      );
    }
    this.footerMargin = (this.dataService.page) ? this.dataService.page.footerMargin : false;
    this.pageSubtitle = (this.dataService.page) ? this.dataService.page.subtitle : false;
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

  public clickMenuLink(menuItem: MenuItem) {
    this.menuOpen = false;
    if (menuItem.name === 'Feedback') {
      window.location.href = 'mailto:contact@healthfoodsmatrix.com';
    } else if (menuItem.link === 'contact') {
      window.location.href = 'mailto:contact@healthfoodsmatrix.com';
    } else if (menuItem.link === 'examples') {
      window.open(AppSettings.EXAMPLES_LINK, '_blank');  
    } else if (menuItem.link === 'guide') {
      window.open(AppSettings.GUIDE_LINK, '_blank');  
    } else if (menuItem.name === 'Facebook') {
      window.open(AppSettings.FACEBOOK_LINK, '_blank');  
    } else if (menuItem.name === 'Shortcut') {
      window.open(AppSettings.CREATE_SHORTCUT_LINK, '_blank');  
    } else if (menuItem.name !== 'My Charts' || this.myChartsActive) {
      this.menuOpen = false;
      // this.router.navigate([menuItem.link, menuItem.data || {}]);
      this.navigateService.navigateTo(menuItem.link, menuItem.data);      
    }  
  }

  private setTranslations(data: any) {
    this.menuItems.forEach(item => {
      item.display = data[item.id] || item.display;
    });
    this.pageText.backButton = data["back"] || "Back";
    this.loadingMisc = false;
  }

  private getMenuTitle(): string {
    return this.menuTitle + (this.textService.language !== 'English' ? ' (' + this.textService.language +')' : '');
  }

  private goBack(): void {
    this.location.back();
  }

  private goHome(): void {
    this.navigateService.navigateTo("home");      
  }
}










