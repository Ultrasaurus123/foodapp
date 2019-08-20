import {
  Component,
  OnInit
} from '@angular/core';
import { Router, } from '@angular/router';
import { AppSettings } from '..';
import { KeysPipe, DataService, TextService } from '../common';

@Component({
  selector: 'about',
  styleUrls: ['./about.component.scss'],
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {
  private pageText: any = {};
  private appName: string = AppSettings.APP_NAME;

  constructor(private router: Router, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'About Us',
      name: 'About'
    };
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error));
  }


  private setTranslations(data: any) {
    this.dataService.page.text = data["menu_about"] || this.dataService.page.text;
  }}
