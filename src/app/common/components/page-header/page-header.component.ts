import {
  Component,
  OnInit
} from '@angular/core';

import { DataService } from '../../services/data.service';

@Component({
  selector: 'page-header',
  styleUrls: ['./page-header.component.scss'],
  templateUrl: './page-header.component.html'
})
  
export class PageHeaderComponent implements OnInit {

  private pageTitle: string;
  private footerMargin: boolean;
  private temp: string;

  constructor(private dataService: DataService) { }

  public ngOnInit() {
  }

  public ngDoCheck() {
    this.pageTitle = this.dataService.currentPage;
    this.footerMargin = false;
    if (this.pageTitle === 'Home' && this.dataService.footerMargin) {
      this.footerMargin = true;
    }
  }

}