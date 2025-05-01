import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { TrackingSheetComponent } from './tracking-sheet/tracking-sheet.component';
import { FilesService } from '../file-uploads-downloads/files.service';
import { CommonModule } from '@angular/common';
import { TrackingSheetService } from './tracking-sheet/tracking-sheet.service';
import { TrackingSheetClient } from './tracking-sheet/model/tracking-sheet.model';
import { CardProSheetService } from './cardpro-sheet/cardpro.service';
import { ImagesComponent } from './images/images.component';
import { ImagesService } from './images/images.service';
import { CardproSheetComponent } from './cardpro-sheet/cardpro-sheet.component';

@Component({
  selector: 'app-work-sheets',
  standalone: true,
  imports: [
    CommonModule,
    TrackingSheetComponent,
    CardproSheetComponent,
    ImagesComponent,
  ],
  templateUrl: './work-sheets.component.html',
  styleUrl: './work-sheets.component.css',
})
export class WorkSheetsComponent implements OnInit {
  activeTab = signal('CardPro Clients');
  tabs: string[] = ['CardPro Clients', 'Images', 'Tracking Sheet'];

  // ImagesComponent notifies WorkSheetsComponent by updating this signal
  dataUpdated = signal<boolean>(false);

  // Notify flag for CardProSheetComponent
  notifyCardProSheetComponent = signal(false);

  isCardProTabActive: boolean = true;
  isImagesTabActive: boolean = false;
  isTrackingTabActive: boolean = false;

  constructor(
    private filesService: FilesService,
    private imagesService: ImagesService,
    private trackingSheetService: TrackingSheetService,
    private cardProSheetService: CardProSheetService
  ) {
    effect(
      () => {

       console.log("AT: ", this.activeTab() === 'CardPro Clients');
       console.log("DU: ", this.dataUpdated());
       console.log("logic: ", this.activeTab() === 'CardPro Clients' && this.dataUpdated());

        if (this.activeTab() === 'CardPro Clients' && this.dataUpdated()) {
          this.notifyCardProSheetComponent.set(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.filesService.trackingSheetEventSubject.subscribe((response) => {
      this.activeTab.set('Tracking Sheet');

      if (this.activeTab() == 'Tracking Sheet') {
        this.trackingSheetService.getTrackingSheetClients({
          pageNumber: 0,
          pageSize: 20,
          sortBy: 'registrationYear',
          search: '',
          filter: '',
        });
      }
    });

    this.filesService.imagesEventSubject.subscribe((response) => {
      this.activeTab.set('Images');

      if (this.activeTab() == 'Images') {
        this.imagesService.getImages({
          pageNumber: 0,
          pageSize: 20,
          sortBy: 'id',
          search: '',
          filter: '',
        });
      }
    });

    this.filesService.cardProSheetEventSubject.subscribe((response) => {
      this.activeTab.set('CardPro Clients');

      if (this.activeTab() == 'CardPro Clients') {
        this.cardProSheetService.getCardProSheetClients({
          pageNumber: 0,
          pageSize: 20,
          sortBy: 'id',
          search: '',
          filter: '',
        });
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // Called by ImagesComponent when it has new data
  onDataUpdatedByImagesComponent() {
    this.dataUpdated.set(true);
  }

  // After notifying CardproSheetComponent, WorkSheetsComponent can reset the flag
  acknowledgeUpdateFromCardproSheetComponent() {
    this.dataUpdated.set(false);
    this.notifyCardProSheetComponent.set(false);
  }
}
