import { Component } from '@angular/core';
import { CardProSheetService } from './cardpro.service';
import { PaginationService } from '../../../util/pagination.service';
import { CardPro as CardProSheetClient } from './cardpro.model';
import { APIResponse } from '../../../util/api-response.model';
import { PaginationAPIResponseModel } from '../../../util/pagination-response.model';
import { CommonModule } from '@angular/common';
import { CardProStats } from './cardpro-stats.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-cardpro-sheet',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './cardpro-sheet.component.html',
  styleUrl: './cardpro.component.css',
})
export class CardproSheetComponent {
  
  apiResponse: APIResponse;

  cardProSheetClients: CardProSheetClient[];

  cardProSheetStats: CardProStats = {
    transactionId: '',
    totalEmails: 0,
    processedEmails: 0,
    notInTrackingSheet: 0,
    notInTrackingSheetEmailList: [],
    emailsNoAttachment: 0,
    hasDifferentEmail: 0,
    hasDifferentEmailList: [],
    emptyEmails: 0,
    emptyPayloadEmails: 0,
    emptyPayloadEmailsList: [],
    totalEmailsWithMultipleImages: 0,
    totalEmailWithMultipleImagesList: [],
  };

  // shows the relavent emails for stats Modal
  activeStatsList: String[];

  // search and filter form group
  filterForm: FormGroup;
  search: string;
  filter: string;

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
  isStatsAvailable: boolean = false;
  isFetchingData: boolean;

  activeCardProClient = {
    name: 'N/A',
    surname: 'N/A',
    registrationNumber: 'N/A',
    practiceNumber: 'N/A',
    dateOfExpiry: '--/--/----',
    email: 'N/A',
    images: [
      {
        id: 0,
        cardProClientId: '',
        attachmentFileName: '',
        attachmentPath: '',
        croppedPath: '',
        cropped: false,
        deleted: false,
      },
    ],
  };

  // Modal open/close variables
  isMoreDetailsModalOpen = false;
  isStatsModalOpen = false;

  constructor(
    private cardProSheetService: CardProSheetService,
    private paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cardProSheetService.response.subscribe((response) => {
      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {
        this.apiResponse = response;
        this.paginationResponseModel = this.apiResponse.data;

        this.cardProSheetClients = response.data.data;

        if (this.cardProSheetClients.length > 0) {
          this.isDataAvailable = true;

          // get the stats
          this.cardProSheetService.getCardProSheetStats();
        }

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

    this.cardProSheetService.cardProStatsResponse.subscribe((response) => {
      if (response.isSuccessful && response.data != null) {
        this.isStatsAvailable = true;

        this.cardProSheetStats = response.data.data;
      }
    });

    this.filterForm = this.formBuilder.group({
      search: [''],
      filter: ['all'],
    });

    this.filterForm.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(values => {
      const { search, filter } = values;
      this.search = search;
      this.filter = filter;

      this.onGetPage(0);
    });

  }

  setActiveStats(stat: string){
    switch(stat){
      case 'notInTrackingSheet':
        this.activeStatsList = this.cardProSheetStats.notInTrackingSheetEmailList
        break
      case 'multipleImages':
        this.activeStatsList = this.cardProSheetStats.totalEmailWithMultipleImagesList
        break
      case 'hasDifferentEmail':  
        this.activeStatsList = this.cardProSheetStats.hasDifferentEmailList
        break
      default:
        this.activeStatsList = []
    }

    this.openModal('isStatsModalOpen')

  }

  openModal(id: string) {
    switch(id){
      case 'isMoreDetailsModalOpen':
        this.isMoreDetailsModalOpen = true
        break;
      case 'isStatsModalOpen':
        this.isStatsModalOpen = true
        break;
    }
  }  

  closeModal(id: string) {
    switch(id){
      case 'isMoreDetailsModalOpen':
        this.isMoreDetailsModalOpen = false
        break;
      case 'isStatsModalOpen':
        this.isStatsModalOpen = false
        break;
    }
  }  

  showTag(client: CardProSheetClient) {
    if (client.notInTrackingSheet) return 'status-not-in-tracking-sheet';

    if (client.images.length > 1) return 'status-multiple-pictures';

    if (client.hasDifferentEmail) return 'status-different-email';

    return 'status-ready';
  }

  showTagTitle(client: CardProSheetClient) {
    if (client.notInTrackingSheet) return 'Not in T.S';

    if (client.images.length > 1) return 'Multi';

    if (client.hasDifferentEmail) return 'Different Email';

    return 'Ready';
  }

  onClientMoreDetailsClient(client: CardProSheetClient) {
    this.activeCardProClient = client;
    this.isMoreDetailsModalOpen = true;
  }

  onGetPage(page: number) {
    this.isFetchingData = true;

    // get the first page of results
    this.cardProSheetService.getCardProSheetClients({
      pageNumber: page,
      pageSize: 10,
      sortBy: 'id',
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
