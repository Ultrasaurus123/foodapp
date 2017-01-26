import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

  public allFoods: Array<any> = [];
  public allConditions: Array<any> = [];
  public agreement: boolean = false;

}
