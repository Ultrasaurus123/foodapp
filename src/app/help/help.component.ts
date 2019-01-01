import {
  Component,
  OnInit
} from '@angular/core';
import { Router, } from '@angular/router';
import { AppSettings } from '..';
import { KeysPipe, DataService, TextService } from '../common';

@Component({
  selector: 'help',
  styleUrls: ['./help.component.scss'],
  templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
  private pageText: any = {};

  constructor(private router: Router, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Help',
      name: 'Help'
    };
    this.textService.getMiscTranslations().subscribe(
      data => this.setTranslations(data),
      error => console.error('Error getting translations: ' + error));
  }


  private setTranslations(data: any) {
    this.dataService.page.text = data["menu_help"] || this.dataService.page.text;
  }}
