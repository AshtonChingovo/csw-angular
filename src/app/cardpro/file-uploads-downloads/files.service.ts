import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { APIResponse } from '../../util/api-response.model';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class FilesService {

  OAuthResponse = new Subject<APIResponse>();
  trackingSheetEventSubject = new Subject<APIResponse>();
  imagesEventSubject = new Subject<APIResponse>();
  cardProSheetEventSubject = new Subject<APIResponse>();
  downloadCardProSheetEventSubject = new Subject<APIResponse>();

  constructor(private httpClient: HttpClient) {}

  getTrackingSheet() {
    return this.httpClient.get(environment.baseUrl + '/tracking-sheet', {
      observe: 'response',
    });
  }

  postTrackingSheet(file: FormData) {
    this.httpClient
      .post(environment.baseUrl + '/tracking-sheet/upload', file, {
        observe: 'response',
      })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Created) {
            apiResponse.isSuccessful = true;
          }
          else if(httpResponse.status == HttpStatusCode.Ok){
            // OAuth URL 
            apiResponse.isSuccessful = false;
            apiResponse.data = httpResponse.body;
            this.OAuthResponse.next(apiResponse);
          } 
          else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.trackingSheetEventSubject.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.trackingSheetEventSubject.next(apiResponse);
        },
      });
  }

  trackingSheetEventEmitterListener() {
    return new Observable((observer) => {
      const eventSource = new EventSource(
        environment.baseUrl + 'v1/tracking-sheet/upload'
      );

      eventSource.onmessage = (event) => {
        observer.next(event.data);
        eventSource.close(); // Close connection after receiving response
        observer.complete();
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };
    });
  }

  extractImages() {
    this.httpClient
      .get(environment.baseUrl + '/attachments', { observe: 'response' })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Created) {
            apiResponse.isSuccessful = true;
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.imagesEventSubject.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.imagesEventSubject.next(apiResponse);
        },
      });
  }

  generateCardProSheet() {
    this.httpClient
      .get(environment.baseUrl + '/cardpro', { observe: 'response' })
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {
            apiResponse.isSuccessful = true;
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.cardProSheetEventSubject.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.cardProSheetEventSubject.next(apiResponse);
        },
      });
  }

  downloadCardProSheet(batchNumber: string) {
    this.httpClient
      .get(
        environment.baseUrl + '/cardpro/download?batchNumber=' + batchNumber,
        { observe: 'response', responseType: 'blob' }
      )
      .subscribe({
        next: (httpResponse) => {
          var apiResponse = new APIResponse();

          if (httpResponse.status == HttpStatusCode.Ok) {

            const blob = httpResponse.body as Blob;
            const contentDisposition = httpResponse.headers.get('Content-Disposition');
            let filename = 'download.zip'; // default

            // Extract filename from the header if available
            if (contentDisposition) {
              const match = contentDisposition.match(/filename="?([^"]+)"?/);
              if (match && match[1]) {
                filename = match[1];
              }
            }

            // Trigger the file download
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(objectUrl);

            apiResponse.isSuccessful = true;
          } else {
            apiResponse.isSuccessful = false;
            apiResponse.errorMessage = 'Unknown error occured';
          }

          this.downloadCardProSheetEventSubject.next(apiResponse);
        },
        error: (e) => {
          var apiResponse = new APIResponse();

          apiResponse.isSuccessful = false;
          apiResponse.errorMessage = 'Unknown error occured';

          this.downloadCardProSheetEventSubject.next(apiResponse);
        },
      });
  }
}
