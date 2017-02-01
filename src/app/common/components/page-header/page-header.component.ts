import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AppSettings } from '../../../';

@Component({
  selector: 'page-header',
  styleUrls: ['./page-header.component.scss'],
  templateUrl: './page-header.component.html'
})

export class PageHeaderComponent implements OnInit {

  public menuOpen: boolean = false;
  public menuItems: Array<{ name: string, link: string }>;

  private pageTitle: string;
  private footerMargin: boolean;
  private myChartsActive: boolean;

  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
  }

  public ngDoCheck() {
    this.pageTitle = this.dataService.currentPage;
    this.footerMargin = false;
    if (this.pageTitle === 'Home' && this.dataService.footerMargin) {
      this.footerMargin = true;
    }
    let myCharts = localStorage.getItem('myCharts');
    if (myCharts) {
      this.dataService.myCharts = JSON.parse(myCharts);
      this.myChartsActive = this.dataService.myCharts && this.dataService.myCharts.length > 0;
    }  
  }

  public toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  public clickMenuLink(menuItem: { name: string, link: string }) {
    if (menuItem.name !== 'My Charts' || this.myChartsActive) {
      this.menuOpen = false;
      this.router.navigateByUrl(menuItem.link)
    }  
  }

}