import { Component, OnInit } from '@angular/core';
import { TrackingSheetService } from './tracking-sheet.service';
import { TrackingSheetClient } from './model/tracking-sheet.model';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../../util/pagination.service';
import { PaginationAPIResponseModel } from '../../../util/pagination-response.model';
import { APIResponse } from '../../../util/api-response.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TrackingSheetStats } from './model/tracking-sheet-stats.model';

@Component({
  selector: 'app-tracking-sheet',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './tracking-sheet.component.html',
  styleUrl: './tracking-sheet.component.css',
})
export class TrackingSheetComponent implements OnInit {
  apiResponse: APIResponse;

  trackingSheetClients: TrackingSheetClient[];
  paginationResponseModel: PaginationAPIResponseModel;

  trackingSheetStats: TrackingSheetStats;

  // search and filter form group
  filterForm: FormGroup;
  search: string;
  filter: string;

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
  isStatsDataAvailable: boolean = false;
  isFetchingData: boolean;

  constructor(
    private trackingSheetService: TrackingSheetService,
    private paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {

    this.onGetPage(0);

    this.trackingSheetService.response.subscribe((response) => {

      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {

        this.trackingSheetClients = response.data.data;

        if (this.trackingSheetClients.length > 0) {
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

        // fetch stats
        if(this.trackingSheetStats == null){
          this.trackingSheetService.getTrackingSheetStats();
        }

      }
    });

    this.trackingSheetService.trackingSheetStatsResponse.subscribe((response) => {
      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {

        this.isStatsDataAvailable = true;

        this.trackingSheetStats = response.data.data;

        if (this.trackingSheetStats != null) {
          this.isStatsDataAvailable = true;
        }

      }
    });

    this.filterForm = this.formBuilder.group({
      search: [''],
      filter: ['all'],
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((values) => {
        const { search, filter } = values;
        this.search = search;
        this.filter = filter;

        this.onGetPage(0);
      });
  }

  onGetPage(page: number) {
    this.isFetchingData = true;

    // get the first page of results
    this.trackingSheetService.getTrackingSheetClients({
      pageNumber: page,
      pageSize: 20,
      sortBy: 'sheetYear',
      search: this.search,
      filter: this.filter,
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
