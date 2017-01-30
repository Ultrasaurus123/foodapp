import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

  public appName: string = 'Food App';
  public allFoods: Array<any> = [];
  public allConditions: Array<any> = [];
  public agreement: boolean = false;
  public currentPage: string;

  private static _instance: DataService;

  constructor() {
    console.log(this.appName);
    return DataService._instance = DataService._instance || this;
  }  

}
