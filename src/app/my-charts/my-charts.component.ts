import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService, PageHeaderComponent, ConfirmModalComponent, Chart } from '../common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'my-charts',
  styleUrls: ['./my-charts.component.scss'],
  templateUrl: './my-charts.component.html'
})
export class MyChartsComponent implements OnInit {
  private myCharts: Array<Chart> = [];
  constructor(private router: Router, private dataService: DataService, private dialogService: DialogService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = 'My Charts';
    this.dataService.currentPageText = 'My Charts';
    this.myCharts = this.dataService.myCharts;
  }

  private selectMyChart(chart: Chart) {
    this.dataService.selectedChart = chart;
    this.router.navigateByUrl('benefits');
  }

  private shareMyChart(chartIndex: number) {
    let chart = this.myCharts[chartIndex];
    chart.dataArray = [];
    let link = window.location.origin + '/benefits?customtable=' + new Buffer(JSON.stringify(this.myCharts[chartIndex])).toString('base64');
    let subject = encodeURI('Check out my custom ' + this.dataService.appName + ' chart!');
    let body = encodeURI('I created a custom health chart using' + this.dataService.appName +
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
