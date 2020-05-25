import { Component, OnInit } from '@angular/core';
import { NavigateService } from '../common'

@Component({
  selector: 'no-content',
  template: `
    <div class="col-12" style="color: black; text-align: center">
      <h1 class="col-12" style="color: black; text-align: center">Oops =&#40;</h1>
      <h5>Something went wrong...</h5>
    </div>
  `
})
export class NoContentComponent implements OnInit {

  constructor(private navigateService: NavigateService) { }

  public ngOnInit() {
    this.navigateService.navigateTo('home');            
  }
}
