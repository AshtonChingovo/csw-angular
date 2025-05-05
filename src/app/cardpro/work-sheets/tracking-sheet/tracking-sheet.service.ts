import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResponse } from '../../../util/api-response.model';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { PageRequestModel } from '../../../util/page-request.model';
import { TrackingSheetRenewalClient } from './model/tracking-sheet-renewal.model';

@Injectable({ providedIn: 'root' })
export class TrackingSheetService {

  response = new Subject<APIResponse>();
  trackingSheetStatsResponse = new Subject<APIResponse>();
  renewalTrackingSheetResponse = new Subject<APIResponse>();
  clientRenewalTrackingSheetResponse = new Subject<APIResponse>();

  constructor(private httpClient: HttpClient) {}

  getTrackingSheetClients(pageRequestModel: PageRequestModel) {
    this.httpClient
      .get(
        environment.baseUrl +
          '/tracking-sheet?pageNumber=' +
          pageRequestModel.pageNumber +
          '&pageSize=' +
          pageRequestModel.pageSize +
          '&search=' +
          pageRequestModel.search +
          '&filter=' +
          pageRequestModel.filter,
        { observe: 'response' }
      )
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {
            apiResponse.isSuccessful = true;

            if (httpResponse.body['content'] != null) {
              apiResponse.data = {
                data: httpResponse.body['content'],
                numberOfElements: httpResponse.body['totalElements'],
                currentPage: httpResponse.body['number'],
                pageSize: httpResponse.body['content'],
                totalPages: httpResponse.body['totalPages'],
                first: httpResponse.body['first'],
                last: httpResponse.body['last'],
                source: 'GET',
              };
            }
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.response.next(apiResponse);

          // get stats
          // this.getTrackingSheetStats();
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.response.next(apiResponse);
        },
      });
  }

  getTrackingSheetStats() {
    this.httpClient
      .get(environment.baseUrl + '/tracking-sheet/stats', {
        observe: 'response',
      })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {
            apiResponse.isSuccessful = true;
            apiResponse.data = {
              data: httpResponse.body,
            };
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          console.log('TrackingSheet Stats:', apiResponse.data);
          this.trackingSheetStatsResponse.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.trackingSheetStatsResponse.next(apiResponse);
        },
      });
  }

  processTrackingSheetStats() {
    this.httpClient
      .get(environment.baseUrl + '/tracking-sheet/renewals', {
        observe: 'response',
      })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {
            apiResponse.isSuccessful = true;
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.renewalTrackingSheetResponse.next(apiResponse);

        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.renewalTrackingSheetResponse.next(apiResponse);
        },
      });
  }

  postTrackingSheetRenewal(trackingSheetRenewalClient: TrackingSheetRenewalClient) {
    this.httpClient
      .post(environment.baseUrl + '/tracking-sheet/renewals', trackingSheetRenewalClient, {
        observe: 'response',
      })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {
            apiResponse.isSuccessful = true;
            apiResponse.data = httpResponse.body;
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.clientRenewalTrackingSheetResponse.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.clientRenewalTrackingSheetResponse.next(apiResponse);
        },
      });
  }

}
