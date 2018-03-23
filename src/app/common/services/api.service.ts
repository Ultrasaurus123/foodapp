import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Http, Response, Headers } from '@angular/http';
import { AppSettings } from '../..';
import { Chart } from '..';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ApiService {

  private static _instance: ApiService;
  private static responses: any = {};
  private static sessionId: string;
  private static headers: Headers;

  constructor(private http: Http) {
    ApiService.createSessionHeader();
    return ApiService._instance = ApiService._instance || this;
  }  

  public get(endpoint: string, tryCache?: boolean): Observable<any> {
    if (tryCache && ApiService.responses[endpoint]) {
      return Observable.of(ApiService.responses[endpoint]);
    }
    ApiService.createSessionHeader();

    return this.http.get(AppSettings.API_ENDPOINT + endpoint, { headers: ApiService.headers })
      .map(res => {
        ApiService.sessionId = res.headers.get('SessionId');
        sessionStorage.setItem('sessionId', ApiService.sessionId);
        ApiService.responses[endpoint] = res.json();
        ApiService.headers.set('SessionId', ApiService.sessionId);
        return res.json();
      })
    .catch(this.handleError)
  }

  
  public getExternal(url: string): Observable<any> {
    return this.http.get(url)
      .map(res => {
        return res.json();
      })
    .catch(this.handleError)
  }

  public post(endpoint: string, body: any): Observable<any> {
    ApiService.createSessionHeader();

    return this.http.post(AppSettings.API_ENDPOINT + endpoint, body)
      .map(res => {
        ApiService.headers.set('SessionId', res.headers.get('SessionId'));
        return res.json();
      })
    .catch(this.handleError)
  }

  private static createSessionHeader() {
    if (!ApiService.headers) {
      ApiService.headers = new Headers();
    }
    ApiService.sessionId = ApiService.sessionId || sessionStorage.getItem('sessionId');
    if (ApiService.sessionId && !ApiService.headers.get('SessionId')) {
      ApiService.headers.append('SessionId', ApiService.sessionId);
    }
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
