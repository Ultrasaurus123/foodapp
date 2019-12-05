import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Http, Response, Headers } from '@angular/http';
import { AppSettings } from '../..';
import AWS, { S3 } from 'aws-sdk';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ApiService {

  private static _instance: ApiService;
  private static responses: any = {};
  private static sessionId: string;
  private static headers: Headers;

  private s3Client: S3;

  constructor(private http: Http) {
    ApiService.createSessionHeader();
    // Initialize the Amazon Cognito credentials provider
    if (!ApiService._instance) {
      console.log("apiservice constructor");
      AWS.config.region = 'us-west-2';
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'us-west-2:c987d996-8163-4df9-ae24-b63c05c2da1e',
      });
      this.s3Client = new AWS.S3({
        apiVersion: '2006-03-01',
        params: { Bucket: "health-foods-matrix" }
      })
    };

    return ApiService._instance = ApiService._instance || this;
  }  

  public get(endpoint: string, tryCache?: boolean): Observable<any> {
    if (tryCache && ApiService.responses[endpoint]) {
      return Observable.of(ApiService.responses[endpoint]);
    }
    ApiService.createSessionHeader();
    ApiService.headers.set('Language', localStorage.getItem('lang') || `"English"`);
    
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
    ApiService.headers.set('Language', localStorage.getItem('lang') || `"English"`);
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

  private getS3Client(): S3 {
    return this.s3Client;
  }
}

export interface UserEvent {
  e: string;  // event
  d: any;  // data 
}
