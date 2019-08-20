import {
  Component,
  OnInit
} from '@angular/core';
import { DataService } from '../../services/data.service';
import { TextService } from '../../services/text.service';
import { NavigateService } from '../../services/navigate.service';

@Component({
  selector: 'ad-banner',
  styleUrls: ['./ad-banner.component.scss'],
  templateUrl: './ad-banner.component.html'
})

export class AdBannerComponent implements OnInit {

  constructor(private navigateService: NavigateService, private dataService: DataService, private textService: TextService) { }

  public ngOnInit() {
  }

  public ngDoCheck() {
  }


}