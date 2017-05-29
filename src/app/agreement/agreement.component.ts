import {
  Component,
  OnInit
} from '@angular/core';
import { DataService } from '../common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../common';

@Component({
  selector: 'agreement',
  styleUrls: ['./agreement.component.scss'],
  templateUrl: './agreement.component.html'
})
export class AgreementComponent implements OnInit {
  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPageText = 'Disclaimer';
    this.dataService.currentPage = 'Disclaimer';
    let agreement = localStorage.getItem('agreement');
    this.dataService.agreement = agreement === 'true';
  }

  private clickAgree() {
    localStorage.setItem('agreement', 'true');
    this.dataService.agreement = true;
    this.router.navigateByUrl(this.dataService.disclaimerRedirectUrl);
  }
}
