import { Component, OnInit } from '@angular/core';
import { DataService } from '../common'

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

  constructor(private dataService: DataService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = '';
  }
}
