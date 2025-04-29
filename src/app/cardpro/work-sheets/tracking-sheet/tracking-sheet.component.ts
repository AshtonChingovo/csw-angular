import { Component, OnInit } from '@angular/core';
import { TrackingSheetService } from './tracking-sheet.service';
import { TrackingSheetClient } from './tracking-sheet.model';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../../util/pagination.service';
import { PaginationAPIResponseModel } from '../../../util/pagination-response.model';
import { APIResponse } from '../../../util/api-response.model';

@Component({
  selector: 'app-tracking-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking-sheet.component.html',
  styleUrl: './tracking-sheet.component.css',
})
export class TrackingSheetComponent implements OnInit {
  apiResponse: APIResponse;

  trackingSheetClients: TrackingSheetClient[];
  paginationResponseModel: PaginationAPIResponseModel;

  // pagination parameters
  pages = [];
  minPage = 0;
  currentPage = 0;
  maxPage = 0;
  isStartEnabled: boolean;
  isPrevEnabled: boolean;
  isNextEnabled: boolean;
  isEndEnabled: boolean;

  isDataAvailable: boolean = false;
  isFetchingData: boolean;

  constructor(
    private trackingSheetService: TrackingSheetService,
    private paginationService: PaginationService
  ) {}

  ngOnInit(): void {
    this.trackingSheetService.response.subscribe((response) => {
      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {
        this.trackingSheetClients = response.data.data;

        if(this.trackingSheetClients.length > 0){
          this.isDataAvailable = true;
        }

        this.apiResponse = response;
        this.paginationResponseModel = this.apiResponse.data;

        // setup pagination
        var paginationParams = this.paginationService.paginationConfig(
          this.apiResponse.data.currentPage,
          this.apiResponse.data.first,
          this.apiResponse.data.last,
          this.apiResponse.data.totalPages
        );

        this.pages = paginationParams.pages;
        this.minPage = paginationParams.minPage;
        this.currentPage = paginationParams.currentPage;
        this.maxPage = paginationParams.maxPage;
        this.isStartEnabled = paginationParams.isStartEnabled;
        this.isPrevEnabled = paginationParams.isPrevEnabled;
        this.isNextEnabled = paginationParams.isNextEnabled;
        this.isEndEnabled = paginationParams.isEndEnabled;
      }
    });
  }

  onGetPage(page: number) {
    this.isFetchingData = true;

    // get the first page of results
    this.trackingSheetService.getTrackingSheetClients({
      pageNumber: page,
      pageSize: 20,
      sortBy: 'registrationYear',
      search: "",
      filter: '',
    });
  }

  onGetPreviousPage() {
    // using paginationResponseModel instead of this.currentPage to not complicate API zero indexing
    if (this.isPrevEnabled)
      this.onGetPage(this.paginationResponseModel.currentPage - 1);
  }

  onGetStartPage() {
    // page indexing starts at zero
    if (this.isStartEnabled) this.onGetPage(0);
  }

  onGetNextPage() {
    // using paginationResponseModel instead of this.currentPage to not complicate API zero indexing
    if (this.isNextEnabled)
      this.onGetPage(this.paginationResponseModel.currentPage + 1);
  }

  onGetEndPage() {
    // page indexing starts at zero
    if (this.isEndEnabled)
      this.onGetPage(this.paginationResponseModel.totalPages - 1);
  }
}
