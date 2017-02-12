import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TextService } from '../../services/text.service';
import { AppSettings } from '../../../';

@Component({
  selector: 'page-header',
  styleUrls: ['./page-header.component.scss'],
  templateUrl: './page-header.component.html'
})

export class PageHeaderComponent implements OnInit {

  public menuOpen: boolean = false;
  public menuItems: Array<{ name: string, display: string, link: string }>;

  private pageTitle: string;
  private footerMargin: boolean;
  private myChartsActive: boolean;
  private self: any;

  constructor(private router: Router, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
    let displays = this.menuItems.map(elem => { return elem.display; });
    this.textService.getText(displays).subscribe(
      text => {
        for (let i = 0; i < this.menuItems.length; i++) {
          this.menuItems[i].display = text[i];
        }
      }
    )
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