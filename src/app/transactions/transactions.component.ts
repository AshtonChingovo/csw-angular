import { Component, OnInit } from '@angular/core';
import { TransactionsService } from './transactions.service';
import { PaginationService } from '../util/pagination.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PaginationAPIResponseModel } from '../util/pagination-response.model';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CardProTransaction } from './cardpro-transactions.model';
import { APIResponse } from '../util/api-response.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit {
  apiResponse: APIResponse;

  // pagination variables
  paginationResponseModel: PaginationAPIResponseModel;
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

  transactions: CardProTransaction[]

  // search and filter form group
  filterForm: FormGroup;
  search: string;
  filter: string;

  constructor(
    private transactionsService: TransactionsService,
    private paginationService: PaginationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {

    this.transactionsService.getTransactions({
      pageNumber: 0,
      pageSize: 30,
      sortBy: "id", 
      search: "", 
      filter: "",
});

    this.filterForm = this.formBuilder.group({
      search: [''],
      filter: [''],
    });

    this.filterForm
      .get('search')
      .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.onGetPage(0);
      });

    this.transactionsService.response.subscribe((response) => {
      this.isFetchingData = false;

      if (response.isSuccessful && response.data != null) {
        this.isDataAvailable = true;
        this.apiResponse = response;

        this.paginationResponseModel = this.apiResponse.data;

        this.transactions = this.apiResponse.data.data;

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
        
      } else {
        // handle error
      }
    });
  }

  onGetPage(page: number) {
    this.isFetchingData = true;

    this.transactionsService.getTransactions({
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
