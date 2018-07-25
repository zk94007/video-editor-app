import * as WebFont from 'webfontloader';

// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

export interface GoogleFontInterface {
    kind: string;
    family: string;
    category: string;

    files: any[];
    variants: string[];
}

export class GoogleFontsInterface {
    kind: string;
    items: any[];
}
export interface FontInterface {
    size: string;
    style: string;
    family: string;

    files?: any;
    styles?: string[];
}

@Injectable()
export class FontPickerService {
  private apiKey = '';

  private baseUrl = 'https://www.googleapis.com/webfonts/v1/webfonts';

  constructor(private http: HttpClient) {
    this.apiKey = 'AIzaSyDlrF-qcSga8p5YVjsTE-s_8oqwBhecvm4';
  }

  /**
   * Loads the given font from Google Web Fonts.
   */
  public loadFont(font: FontInterface): void {
    try {
      WebFont.load({
        google: {
          families: [font.family + ':' + font.style]
        }
      });
    } catch (e) {
      console.warn('Failed to load the font:', font);
    }
  }

  /**
   * Returns list of all fonts with given sort option:
   * date || alpha || style || trending || popularity
   */

  public getAllFonts(sort: string): Observable<GoogleFontsInterface> {
    let requestUrl = this.baseUrl + '?key=' + this.apiKey;

    if (sort) {
      requestUrl = requestUrl.concat('&sort=' + sort);
    }

    return <Observable<GoogleFontsInterface>> this.http.get(requestUrl).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Returns font object for the requested font family.
   */

  public getRequestedFont(family: string): Observable<FontInterface> {
    const requestUrl = 'https://fonts.googleapis.com/css?family=' + family + ':100,400';

    return <Observable<FontInterface>> this.http.get(requestUrl).pipe(
      catchError(this.handleHttpError)
    );
  }

  /**
   * Handler method for all possible http request errors.
   */

  private handleHttpError(error: any): Observable<string> {
    console.error(error);

    const errMsg = (error.error instanceof Error) ?
      error.error.message : (error.status || 'Unknown error');

    return Observable.of(errMsg);
  }
}
