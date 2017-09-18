import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Response } from '@angular/http';
import { AppSettings } from '../..';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Router, ActivatedRoute } from '@angular/router';
import { TextService } from './text.service';

@Injectable()
export class NavigateService {

  private static _instance: NavigateService;
  
  private langData: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private textService: TextService) {
    return NavigateService._instance = NavigateService._instance || this;
  }  

  public getRouteData(route: ActivatedRoute): Observable<any> {
    return route.params.map((data: any) => {
      // temp workaround for farsi
      if (data.lang && (data.lang.toLowerCase() === 'fa' || data.lang.toLowerCase() === 'farsi' || data.lang.toLowerCase() === 'persian')) {
        this.langData = data.lang;
        this.textService.language = 'Persian';
      } else {
        this.langData = '';
      }
      return data;
    });
  }

  public navigateTo(route: string, data?: any) {
    let routeData = data || {};
    if (this.langData) {
      routeData.lang = this.langData;
    }  
    this.router.navigate([route, routeData]);
  }

}
