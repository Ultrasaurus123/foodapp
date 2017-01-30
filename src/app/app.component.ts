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
      <div  class="m-t-70">
      <router-outlet></router-outlet>
      </div>
    </main>
  `
})
export class AppComponent implements OnInit {

  public menuOpen: boolean = false;
  public pageTitle: string = '';
  public menuItems: Array<{ name: string, link: string }>;

  constructor(private router: Router) { }

  public ngOnInit() {
    this.menuItems = AppSettings.NAV_MENU;
  }

  public toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  public clickMenuLink(menuItem: { name: string, link: string }) {
    this.pageTitle = menuItem.name;
    this.menuOpen = false;
    this.router.navigateByUrl(menuItem.link)
  }
}
