import {
  Component,
  OnInit
} from '@angular/core';
import { DataService } from '../common';
import { Router } from '@angular/router';

@Component({
  selector: 'agreement',
  styleUrls: ['./agreement.component.scss'],
  templateUrl: './agreement.component.html'
})
export class AgreementComponent implements OnInit {
  constructor(private router: Router, private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
  }

  private clickAgree() {
    this.dataService.agreement = true;
    this.router.navigateByUrl('home');
  }
}
