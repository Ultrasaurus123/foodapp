import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService, NavigateService } from '..'

@Injectable()
export class CanActivateAgreement implements CanActivate {
  constructor(private dataService: DataService, private navigateService: NavigateService) {
  }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let savedAgreement = localStorage.getItem('agreement');
    if (savedAgreement || this.dataService.agreement) {
      return true;
    } else {
      this.navigateService.navigateTo('disclaimer');
      this.dataService.disclaimerRedirectUrl = state.url;
      return false;
    }
  }
}