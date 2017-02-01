import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DataService } from '..'

@Injectable()
export class CanActivateAgreement implements CanActivate {
  constructor(private dataService: DataService, private router: Router) {}
  
  canActivate(): boolean {
    let savedAgreement = localStorage.getItem('agreement');
    if (savedAgreement || this.dataService.agreement) {
      return true;
    } else {
      this.router.navigateByUrl('disclaimer');
      return false;
    }
  }
}