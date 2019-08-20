import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from '.';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
  template: `
    <main>
      <page-header></page-header>
      <div  class="m-t-70 page-body">
      <router-outlet></router-outlet>
      <page-footer></page-footer>
      <ad-banner></ad-banner>
      </div>
    </main>
  `
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  public ngOnInit() {
  }
}
