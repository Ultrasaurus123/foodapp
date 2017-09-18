import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService, PageHeaderComponent, ConfirmModalComponent, Chart, NavigateService } from '../common';
import { DialogService } from "ng2-bootstrap-modal";
import { AppSettings } from '..';

@Component({
  selector: 'my-charts',
  styleUrls: ['./my-charts.component.scss'],
  templateUrl: './my-charts.component.html'
})
export class MyChartsComponent implements OnInit {
  private myCharts: Array<Chart> = [];
  constructor(private navigateService: NavigateService, private dataService: DataService, private dialogService: DialogService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.page = {
      text: 'My Charts',
      name: 'My Charts',
    };
    this.myCharts = this.dataService.myCharts;
  }

  private selectMyChart(chart: Chart) {
    this.dataService.selectedChart = chart;
    this.navigateService.navigateTo('benefits');
  }

  private shareMyChart(chartIndex: number) {
    let chart = this.myCharts[chartIndex];
    let link = window.location.origin + '/#/benefits?customtable=' + new Buffer(JSON.stringify(chart)).toString('base64');
    let subject = encodeURIComponent('Check out my custom ' + AppSettings.APP_NAME + ' chart!');
    let body = encodeURIComponent('I created a custom health chart using ' + AppSettings.APP_NAME +
      '.  You can view it by clicking the link below.\n' + chart.name + ': ' + link);
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
  }

  private deleteMyChart(chartIndex: number) {
    let disposable = this.dialogService.addDialog(ConfirmModalComponent, {
      title: 'Remove this chart?'
    })
      .subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.myCharts.splice(chartIndex, 1);
          this.dataService.myCharts = this.myCharts;
          localStorage.setItem('myCharts', JSON.stringify(this.myCharts));
        }
      });
  }
}
