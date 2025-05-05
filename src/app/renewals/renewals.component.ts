import { Component } from '@angular/core';
import { APIResponse } from '../util/api-response.model';
import { TrackingSheetClient } from '../cardpro/work-sheets/tracking-sheet/model/tracking-sheet.model';
import { PaginationAPIResponseModel } from '../util/pagination-response.model';
import { TrackingSheetService } from '../cardpro/work-sheets/tracking-sheet/tracking-sheet.service';
import { PaginationService } from '../util/pagination.service';
import { CommonModule } from '@angular/common';
import { on } from 'events';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TrackingSheetStats } from '../cardpro/work-sheets/tracking-sheet/model/tracking-sheet-stats.model';

@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './renewals.component.html',
  styleUrl: './renewals.component.css',
})
export class RenewalsComponent {
  apiResponse: APIResponse;

  trackingSheetClients: TrackingSheetClient[];
  paginationResponseModel: PaginationAPIResponseModel;

  ACTIVE_MEMBERSHIP = 'active';
  RENEWAL_DUE = 'renewal_due';

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
  isProcessingTrackingSheet: boolean = false;
  isFetchingData: boolean;

  isRenewingClient = false;

  // stats variables
  trackingSheetStats: TrackingSheetStats;
  isStatsDataAvailable: boolean = false;

  // client being renewed
  trackingSheetRenewalClient: TrackingSheetClient;

  constructor(
    private trackingSheetService: TrackingSheetService,
    private paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.trackingSheetService.trackingSheetStatsResponse.subscribe(
      (response) => {
        this.isFetchingData = false;

        if (response.isSuccessful && response.data != null) {
          this.isStatsDataAvailable = true;

          this.trackingSheetStats = response.data.data;

          if (this.trackingSheetStats != null) {
            this.isStatsDataAvailable = true;
          }
        }
      }
    );

    this.trackingSheetService.response.subscribe((response) => {
      this.isFetchingData = false;
      this.isProcessingTrackingSheet = false;

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

        // get latest tracking sheet stats
        this.trackingSheetService.getTrackingSheetStats();
      }
    });

    this.trackingSheetService.renewalTrackingSheetResponse.subscribe(
      (response) => {
        this.isFetchingData = false;

        if (response.isSuccessful) {
          this.isProcessingTrackingSheet = false;

          // get the first page of results after processing
          this.onGetPage(0);
        }
      }
    );

    this.trackingSheetService.clientRenewalTrackingSheetResponse.subscribe(
      (response) => {
        this.trackingSheetRenewalClient.renewing = false;

        if (response.isSuccessful) {
          this.trackingSheetRenewalClient = response.data;

          // get latest tracking sheet stats
          this.trackingSheetService.getTrackingSheetStats();

          // this.onGetPage(0);
        }
      }
    );

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

  processTrackingSheet() {
    this.isProcessingTrackingSheet = true;
    this.trackingSheetService.processTrackingSheetStats();
  }

  onRenewClient(client: TrackingSheetClient) {
    this.trackingSheetRenewalClient = client;
    this.trackingSheetRenewalClient.renewing = true;

    this.trackingSheetService.postTrackingSheetRenewal(client);
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
