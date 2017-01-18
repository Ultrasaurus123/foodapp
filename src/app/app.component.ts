import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

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
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {
  constructor() { }

  public ngOnInit() {
  }

}
