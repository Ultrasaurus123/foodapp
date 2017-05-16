import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataService } from '..'

@Injectable()
export class CanActivateAgreement implements CanActivate {
  constructor(private dataService: DataService, private router: Router) {
  }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let savedAgreement = localStorage.getItem('agreement');
    if (savedAgreement || this.dataService.agreement) {
      return true;
    } else {
      this.router.navigateByUrl('disclaimer');
      this.dataService.disclaimerRedirectUrl = state.url;
      return false;
    }
  }
}