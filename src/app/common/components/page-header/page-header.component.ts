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
  private displays: Array<string>;
  private footerMargin: boolean;
  private myChartsActive: boolean;
  private self: any;

  constructor(private router: Router, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
    this.displays = this.menuItems.map(elem => { return elem.display; });   
    this.updateMenuItems();
  }

  public updateMenuItems() {
     this.textService.getText(this.displays).subscribe(
      text => {
        for (let i = 0; i < this.menuItems.length; i++) {
          this.menuItems[i].display = text[i];
        }
      }
    )
  }

  public ngDoCheck() {
    if (this.textService.languageChanged) {
      this.updateMenuItems();
      this.textService.languageChanged = false;
    } 
    this.pageTitle = this.dataService.currentPageText;
    this.footerMargin = (this.dataService.currentPage === 'Search');
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