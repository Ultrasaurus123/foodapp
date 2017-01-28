import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { Router} from '@angular/router';

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
  // <nav>
  //   <a [routerLink]=" ['./'] " routerLinkActive="active">
  //     Home
  //   </a>
  //   <a [routerLink]=" ['./benefits'] " routerLinkActive="active">
  //     Benefits Table
  //   </a>
  // </nav>
  template: `
    <main>
    <ul class="topnav" id="myTopnav" [class.responsive]="menuOpen">
  <li><a (click)="clickMenuLink('home')">Home</a></li>
  <li><a (click)="clickMenuLink('settings')">Settings</a></li>
  <li><a (click)="clickMenuLink('help')">Help</a></li>
  <li><a (click)="clickMenuLink('about')">About</a></li>
  <li class="icon">
    <a style="font-size:15px;" (click)="toggleMenu()">☰</a>
  </li>
</ul>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {

  public menuOpen: boolean: false;

  constructor(private router: Router) { }

  public ngOnInit() {
  }

  public toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  public clickMenuLink(link: string) {
    this.menuOpen = false;
    this.router.navigateByUrl(link)
  }
}
