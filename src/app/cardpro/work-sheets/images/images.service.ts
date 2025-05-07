import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { APIResponse } from '../../../util/api-response.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { PageRequestModel } from '../../../util/page-request.model';
import { environment } from '../../../../environments/environment.development';
import { ImageDelete } from './image-delete.model';

@Injectable({ providedIn: 'root' })
export class ImagesService {

  response = new Subject<APIResponse>();
  cardProStatsResponse = new Subject<APIResponse>();
  deletionResponse = new Subject<APIResponse>();

  constructor(private httpClient: HttpClient) {}

  getImages(pageRequestModel: PageRequestModel) {
    this.httpClient
      .get(
        environment.baseUrl +
          '/cardpro?pageNumber=' +
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

          } else if(httpResponse.status == HttpStatusCode.Unauthorized) {
            console.log('API ERROR CLAUSE');
            console.log('API Error: ', httpResponse);

            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }
          else {
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

  getImagesStats() {
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

        // console.log('CardPro Stats:', apiResponse.data);
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

  postImageDeletion(imageDelete: ImageDelete) {
    this.httpClient
      .post(environment.baseUrl + '/attachments/remove', imageDelete, {
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

          this.deletionResponse.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.deletionResponse.next(apiResponse);
        },
      });
  }

  postUndoImageDeletion(imageDelete: ImageDelete) {
    this.httpClient
      .post(environment.baseUrl + '/attachments/remove/undo', imageDelete, {
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

          this.deletionResponse.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.deletionResponse.next(apiResponse);
        },
      });
  }

}
