import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppSettings } from '../..';

@Injectable()
export class TextService {
    public languageChanged: boolean = false;
    public loadedFoodSinceChange: boolean = true;
    public loadedCondSinceChange: boolean = true;
    public rightJustify: boolean = false;
    
    private _language: string = 'English';
    get language(): string {
        return this._language;
    }
    set language(language: string) {
        this._language = language;
        this.loadedFoodSinceChange = this.loadedCondSinceChange = false;
        this.languageChanged = true;
        this.rightJustify = AppSettings.RIGHT_JUSTIFIED_LANGUAGES[this._language.toLowerCase()];        
    }

    private static _instance: TextService;
    private static _languages: Array<string>;

    constructor(private apiService: ApiService) {
        let sessionLang = localStorage.getItem('lang');
        if (sessionLang) {
            this._language = JSON.parse(sessionLang);
        }
        this.rightJustify = AppSettings.RIGHT_JUSTIFIED_LANGUAGES[this._language.toLowerCase()];                
        return TextService._instance = TextService._instance || this;
    }

    public getTranslation(type: string): Observable<any> {
        if (!type) {
            return Observable.of({});
        }
        if (this.language === 'English') {
            return Observable.of({});
        }
        // if (type === 'food' && this.dataService.translatedFoods) {
        //     return Observable.of(this.dataService.translatedFoods);
        // } else if (type === 'condition' && this.dataService.translatedConditions) {
        //     return Observable.of(this.dataService.translatedConditions);
        // }
        let queryString = 'type=' + type + '&lang=' + this.language.toLowerCase();

        return this.apiService.get(AppSettings.API_ROUTES.TRANSLATIONS + '?' + encodeURI(queryString), true);
    }

    public getMiscTranslations(): Observable<any> {
        return this.apiService.get(AppSettings.API_ROUTES.MISC_TRANSLATIONS + '?lang=' + this.language.toLowerCase(), true);
    }

    public getLanguages(): Array<string> {
        return TextService._languages;
    }

    public loadAfterChange(view: string) {
        console.log(view);
        if (view.toLowerCase() === 'food') {
            this.loadedFoodSinceChange = true;
        } else if (view.toLowerCase() === 'condition') {
            this.loadedCondSinceChange = true;            
        }
        this.languageChanged = !(this.loadedFoodSinceChange && this.loadedCondSinceChange);
        console.log(this.languageChanged);
    }
}
