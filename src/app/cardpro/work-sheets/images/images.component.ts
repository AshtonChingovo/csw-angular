import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PaginationAPIResponseModel } from '../../../util/pagination-response.model';
import { CommonModule } from '@angular/common';
import { APIResponse } from '../../../util/api-response.model';
import { Images } from './images.model';
import { ImagesService } from './images.service';
import { PaginationService } from '../../../util/pagination.service';
import { ReactiveFormsModule } from '@angular/forms';
import {
  CardPro,
  CardPro as CardProSheetClient,
} from '../cardpro-sheet/cardpro.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

export type CropperDialogResult = {
  blob: Blob;
  imageUrl: string;
};

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.css',
})
export class ImagesComponent implements OnInit {
  @Output() dataUpdated = new EventEmitter<void>();

  apiResponse: APIResponse;

  cardProSheetClients: CardProSheetClient[];
  images: Images[];
  paginationResponseModel: PaginationAPIResponseModel;

  // search and filter form group
  filterForm: FormGroup;
  search: string;
  filter: string;

  // modal open/close variables
  isViewImageModalOpen = false;
  isDeleteImageModalOpen = false;
  isUndoImageDeleteModalOpen = false;
  isNotInTrackingSheetModalOpen = false;

  // image active on the dialog
  activeImageOnDialog = {
    id: 0,
    cardProClientId: '',
    attachmentFileName: '',
    attachmentPath: '',
    url: '',
    croppedPath: '',
    cropped: false,
    deleted: false,
  };

  cardProStats = {
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

  // pagination variables
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

  imagePath = 'http://localhost:4200/assets/images/avatar.jpg';
  result: CropperDialogResult | undefined;

  constructor(
    private imagesService: ImagesService,
    private paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.imagesService.response.subscribe((response) => {
      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {
        this.apiResponse = response;
        this.paginationResponseModel = this.apiResponse.data;

        this.cardProSheetClients = this.apiResponse.data.data;

        this.images = this.cardProSheetClients
          .sort((a, b) => {
            const imageDiff = b.images.length - a.images.length;
            if (imageDiff !== 0) {
              return imageDiff; // sort by image count first
            }
            return a.name.localeCompare(b.name); // if same count, sort alphabetically
          })
          .flatMap((client) => client.images);

        if (this.images.length > 0) {
          this.isDataAvailable = true;
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

        //get stats
        this.imagesService.getImagesStats();
      }
    });

    this.imagesService.deletionResponse.subscribe((response) => {
      if (response.isSuccessful && response.data != null) {
        // notify WorkSheetsComponent that data has been updated
        this.dataUpdated.emit();

        var responseImage = response.data;

        this.images.find((image) => image.id == responseImage.id).deleted =
          response.data.deleted;
      }
    });

    this.imagesService.cardProStatsResponse.subscribe((response) => {
      if (response.isSuccessful && response.data != null) {
        this.cardProStats = response.data.data;
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

  // imageCropped(event: ImageCroppedEvent) {
  //   const { blob, objectUrl } = event;

  //   if (blob && objectUrl) {
  //     this.result = { blob, imageUrl: objectUrl };
  //   }
  // }

  onImageSelected(image: Images) {
    this.activeImageOnDialog = image;
  }

  hasMultipleImages(clientId: string): boolean {
    if (clientId == null || clientId == undefined) return false;

    return (
      this.cardProSheetClients.find((client) => client.id == clientId).images
        .length > 1
    );
  }

  showImageDeleteButton(image: Images) {
    if (image.cardProClientId == null || image.cardProClientId == undefined)
      return false;

    if (image.deleted == true) return false;

    return (
      this.cardProSheetClients.find(
        (client) => client.id == image.cardProClientId
      ).images.length > 1
    );
  }

  onDelete() {
    this.isDeleteImageModalOpen = false;

    this.imagesService.postImageDeletion({
      clientId: this.activeImageOnDialog.cardProClientId,
      id: this.activeImageOnDialog.id,
    });
  }

  onUndoDelete() {
    this.isUndoImageDeleteModalOpen = false;

    this.imagesService.postUndoImageDeletion({
      clientId: this.activeImageOnDialog.cardProClientId,
      id: this.activeImageOnDialog.id,
    });
  }

  // modal open & close operations
  openModal(modalId: string) {
    switch (modalId) {
      case 'isViewImageModalOpen':
        this.isViewImageModalOpen = true;
        break;
      case 'isDeleteImageModalOpen':
        this.isDeleteImageModalOpen = true;
        break;
      case 'isUndoImageDeleteModalOpen':
        this.isUndoImageDeleteModalOpen = true;
        break;
      case 'isNotInTrackingSheetModalOpen':
        this.isNotInTrackingSheetModalOpen = true;
        break;
    }
  }

  // Close the modal
  closeModal(modalId: string) {
    switch (modalId) {
      case 'isViewImageModalOpen':
        this.isViewImageModalOpen = false;
        break;
      case 'isDeleteImageModalOpen':
        this.isDeleteImageModalOpen = false;
        break;
      case 'isUndoImageDeleteModalOpen':
        this.isUndoImageDeleteModalOpen = false;
        break;
      case 'isNotInTrackingSheetModalOpen':
        this.isNotInTrackingSheetModalOpen = false;
        break;
    }
  }

  onGetPage(page: number) {
    this.isFetchingData = true;

    this.imagesService.getImages({
      pageNumber: page,
      pageSize: 20,
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
