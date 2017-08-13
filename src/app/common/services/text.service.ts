import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../..';
// import { DataService } from './data.service'

@Injectable()
export class TextService {
    public languageChanged: boolean = false;

    private _language: { name: string, code: string } = { name: 'English', code: 'en' };
    get language(): { name: string, code: string } {
        return this._language;
    }
    set language(language: { name: string, code: string }) {
        this._language = language;
        this.languageChanged = true;
    }
    private static _instance: TextService;
    private static _languages: Array<{ name: string, code: string }>;

    constructor(private http: Http) {
        if (!TextService._languages || TextService.length === 0) {
            this.initLanguages();
        }
        let sessionLang = sessionStorage.getItem('lang');
        if (sessionLang) {
            this._language = JSON.parse(sessionLang);
        }
        return TextService._instance = TextService._instance || this;
    }

    public getText(source: Array<string>): Observable<Array<string>> {
        if (!source || source.length === 0) {
            return null;
        }
        if (this.language.code === 'en') {
            return Observable.of(source);
        }
        let queryString = source.join('. ');

        return this.http.get('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + this.language.code + '&dt=t&q=' + encodeURI(queryString))
            .map(res => {
                let text = res.text();
                while (text.indexOf(',,') > -1) {
                    text = text.replace(',,', ',');
                }

                let translations = JSON.parse(text)[0];
                let parsedStrings: Array<string> = [];
                for (let i = 0; i < translations.length; i++) {
                    let translation = translations[i][0];

                    if (translation.indexOf('. ') === -1) {
                        parsedStrings.push(translation);
                        continue;
                    }
                    let parseIndex = translation.indexOf('. ');
                    while (parseIndex > -1) {
                        parsedStrings.push(translation.substring(0, parseIndex));
                        translation = translation.slice(parseIndex + 4);
                        parseIndex = translation.indexOf('. ');
                    }
                }
                // let translation = JSON.parse(text)[0][0][0];
                // if (translation.indexOf('. ') === -1) {
                //     return [translation];
                // }
                // let parsedStrings: Array<string> = [];
                // let parseIndex = translation.indexOf('. ');
                // while (parseIndex > -1) {
                //     parsedStrings.push(translation.substring(0, parseIndex));
                //     translation = translation.slice(parseIndex + 4);
                //     parseIndex = translation.indexOf('. ');
                // }
                // parsedStrings.push(translation);
                return parsedStrings;
            });
        //   .catch(this.handleError)
    }

    public getTranslation(type: string): Observable<any> {
        if (!type) {
            return Observable.of({});
        }
        if (this.language.code === 'en') {
            return Observable.of({});
//            return Observable.of((type === 'food') ? this.dataService.allFoods : this.dataService.allConditions);
        }
        let queryString = 'type=' + type + '&lang=' + this.language.name.toLowerCase() + '&code=' + this.language.code.toLowerCase();

        return this.http.get(AppSettings.API_ENDPOINT + 'getTranslation?' + encodeURI(queryString))
            .map(res => {
                console.log(res);
                return res.json();
            });
        //   .catch(this.handleError)
    }

    public getLanguages(): Array<{ name: string, code: string }> {
        return TextService._languages;
    }

    private initLanguages(): void {
        TextService._languages = [
            { name: 'Afrikaans', code: 'af' },
            { name: 'Albanian', code: 'sq' },
            { name: 'Amharic', code: 'am' },
            { name: 'Arabic', code: 'ar' },
            { name: 'Armenian', code: 'hy' },
            { name: 'Azeerbaijani', code: 'az' },
            { name: 'Basque', code: 'eu' },
            { name: 'Belarusian', code: 'be' },
            { name: 'Bengali', code: 'bn' },
            { name: 'Bosnian', code: 'bs' },
            { name: 'Bulgarian', code: 'bg' },
            { name: 'Catalan', code: 'ca' },
            { name: 'Cebuano', code: 'ceb' },
            { name: 'Chichewa', code: 'ny' },
            { name: 'Chinese (Simplified)', code: 'zh-CN' },
            { name: 'Chinese (Traditional)', code: 'zh-TW' },
            { name: 'Corsican', code: 'co' },
            { name: 'Croatian', code: 'hr' },
            { name: 'Czech', code: 'cs' },
            { name: 'Danish', code: 'da' },
            { name: 'Dutch', code: 'nl' },
            { name: 'English', code: 'en' },
            { name: 'Esperanto', code: 'eo' },
            { name: 'Estonian', code: 'et' },
            { name: 'Filipino', code: 'tl' },
            { name: 'Finnish', code: 'fi' },
            { name: 'French', code: 'fr' },
            { name: 'Frisian', code: 'fy' },
            { name: 'Galician', code: 'gl' },
            { name: 'Georgian', code: 'ka' },
            { name: 'German', code: 'de' },
            { name: 'Greek', code: 'el' },
            { name: 'Gujarati', code: 'gu' },
            { name: 'Haitian Creole', code: 'ht' },
            { name: 'Hausa', code: 'ha' },
            { name: 'Hawaiian', code: 'haw' },
            { name: 'Hebrew', code: 'iw' },
            { name: 'Hindi', code: 'hi' },
            { name: 'Hmong', code: 'hmn' },
            { name: 'Hungarian', code: 'hu' },
            { name: 'Icelandic', code: 'is' },
            { name: 'Igbo', code: 'ig' },
            { name: 'Indonesian', code: 'id' },
            { name: 'Irish', code: 'ga' },
            { name: 'Italian', code: 'it' },
            { name: 'Japanese', code: 'ja' },
            { name: 'Javanese', code: 'jw' },
            { name: 'Kannada', code: 'kn' },
            { name: 'Kazakh', code: 'kk' },
            { name: 'Khmer', code: 'km' },
            { name: 'Korean', code: 'ko' },
            { name: 'Kurdish', code: 'ku' },
            { name: 'Kyrgyz', code: 'ky' },
            { name: 'Lao', code: 'lo' },
            { name: 'Latin', code: 'la' },
            { name: 'Latvian', code: 'lv' },
            { name: 'Lithuanian', code: 'lt' },
            { name: 'Luxembourgish', code: 'lb' },
            { name: 'Macedonian', code: 'mk' },
            { name: 'Malagasy', code: 'mg' },
            { name: 'Malay', code: 'ms' },
            { name: 'Malayalam', code: 'ml' },
            { name: 'Maltese', code: 'mt' },
            { name: 'Maori', code: 'mi' },
            { name: 'Marathi', code: 'mr' },
            { name: 'Mongolian', code: 'mn' },
            { name: 'Burmese', code: 'my' },
            { name: 'Nepali', code: 'ne' },
            { name: 'Norwegian', code: 'no' },
            { name: 'Pashto', code: 'ps' },
            { name: 'Persian', code: 'fa' },
            { name: 'Polish', code: 'pl' },
            { name: 'Portuguese', code: 'pt' },
            { name: 'Punjabi', code: 'ma' },
            { name: 'Romanian', code: 'ro' },
            { name: 'Russian', code: 'ru' },
            { name: 'Samoan', code: 'sm' },
            { name: 'Scots Gaelic', code: 'gd' },
            { name: 'Serbian', code: 'sr' },
            { name: 'Sesotho', code: 'st' },
            { name: 'Shona', code: 'sn' },
            { name: 'Sindhi', code: 'sd' },
            { name: 'Sinhala', code: 'si' },
            { name: 'Slovak', code: 'sk' },
            { name: 'Slovenian', code: 'sl' },
            { name: 'Somali', code: 'so' },
            { name: 'Spanish', code: 'es' },
            { name: 'Sundanese', code: 'su' },
            { name: 'Swahili', code: 'sw' },
            { name: 'Swedish', code: 'sv' },
            { name: 'Tajik', code: 'tg' },
            { name: 'Tamil', code: 'ta' },
            { name: 'Telugu', code: 'te' },
            { name: 'Thai', code: 'th' },
            { name: 'Turkish', code: 'tr' },
            { name: 'Ukrainian', code: 'uk' },
            { name: 'Urdu', code: 'ur' },
            { name: 'Uzbek', code: 'uz' },
            { name: 'Vietnamese', code: 'vi' },
            { name: 'Welsh', code: 'cy' },
            { name: 'Xhosa', code: 'xh' },
            { name: 'Yiddish', code: 'yi' },
            { name: 'Yoruba', code: 'yo' },
            { name: 'Zulu', code: 'zu' }
        ]

    }
}
