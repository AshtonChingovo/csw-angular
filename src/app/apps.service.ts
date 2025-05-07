import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { APIResponse } from './util/api-response.model';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AppService {

  response = new Subject<APIResponse>();
  OAuthResponse = new Subject<APIResponse>();

  constructor(private httpClient: HttpClient) {}

  checkOAuthToken() {
    this.httpClient
      .get(
        environment.baseUrl +
          '/oauth2/token-check' ,
        { observe: 'response' }
      )
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {

            apiResponse.isSuccessful = true;

            if (httpResponse.body != null) {
              apiResponse.data = httpResponse.body;
            }

          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.response.next(apiResponse);

        },
        error: (e) => {

          console.log("API Error: ", e)

          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.response.next(apiResponse);
        },
      });
  }

  getOAuthUrl() {
    this.httpClient
      .get(
        environment.baseUrl +
          '/oauth2/auth-url' ,
        { observe: 'response' }
      )
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {

            apiResponse.isSuccessful = true;

            if (httpResponse.body != null) {
              apiResponse.data = httpResponse.body;
            }

          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.OAuthResponse.next(apiResponse);

        },
        error: (e) => {

          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.OAuthResponse.next(apiResponse);
        },
      });
  }

}
