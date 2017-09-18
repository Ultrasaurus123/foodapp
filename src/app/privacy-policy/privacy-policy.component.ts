import {
  Component,
  OnInit
} from '@angular/core';
import { DataService } from '../common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../common';

@Component({
  selector: 'privacy-policy',
  styleUrls: ['./privacy-policy.component.scss'],
  templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'Privacy Policy',
      name: 'Privacy'
    };
  }
}
