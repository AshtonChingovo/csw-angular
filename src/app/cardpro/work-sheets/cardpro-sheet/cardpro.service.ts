
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { APIResponse } from '../../../util/api-response.model';
import { Subject } from 'rxjs';
import { PageRequestModel } from '../../../util/page-request.model';
import { HttpClient, HttpStatusCode } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CardProSheetService {

  response = new Subject<APIResponse>();
  cardProStatsResponse = new Subject<APIResponse>();

  constructor(private httpClient: HttpClient) {}

  getCardProSheetClients(pageRequestModel: PageRequestModel) {
    this.httpClient
      .get(
        environment.baseUrl +
          '/cardpro/valid?pageNumber=' +
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
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.response.next(apiResponse);
        },
      });
  }

  getCardProSheetStats() {

    this.httpClient
    .get(
      environment.baseUrl +
        '/cardpro/stats',
      { observe: 'response' }
    )
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

        this.cardProStatsResponse.next(apiResponse);

      },
      error: (e) => {
        var apiResponse = new APIResponse();

        apiResponse.isSuccessful = false;
        apiResponse.errorMessage = 'Unknown error occured';

        this.cardProStatsResponse.next(apiResponse);
      },
    });
  }

}
