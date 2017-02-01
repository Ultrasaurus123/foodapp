import {
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService, PageHeaderComponent, ConfirmModalComponent } from '../common';
import { DialogService } from "ng2-bootstrap-modal";

@Component({
  selector: 'my-charts',
  styleUrls: ['./my-charts.component.scss'],
  templateUrl: './my-charts.component.html'
})
export class MyChartsComponent implements OnInit {
  private myCharts: Array<any> = [];
  constructor(private router: Router, private dataService: DataService, private dialogService: DialogService) { }

  public ngOnInit() {
    window.scrollTo(0, 0);
    this.dataService.currentPage = 'My Charts';
    this.myCharts = this.dataService.myCharts;
  }

  private selectMyChart(chart: any) {
    this.dataService.selectedChart = chart;
    this.router.navigateByUrl('benefits');
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
