import {
  Component,
  OnInit
} from '@angular/core';
import { Router, } from '@angular/router';
import { AppSettings } from '..';
import { KeysPipe, DataService } from '../common';

@Component({
  selector: 'help',
  styleUrls: ['./help.component.scss'],
  templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {

  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Help',
      name: 'Help'
    };
  }
}
