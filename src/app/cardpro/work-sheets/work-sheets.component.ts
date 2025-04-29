import { Component, OnInit } from '@angular/core';
import { TrackingSheetComponent } from "./tracking-sheet/tracking-sheet.component";
import { FilesService } from '../file-uploads-downloads/files.service';
import { CommonModule } from '@angular/common';
import { TrackingSheetService } from './tracking-sheet/tracking-sheet.service';
import { TrackingSheetClient } from './tracking-sheet/tracking-sheet.model';
import { CardProSheetService } from './cardpro-sheet/cardpro.service';
import { ImagesComponent } from "./images/images.component";
import { ImagesService } from './images/images.service';
import { CardproSheetComponent } from './cardpro-sheet/cardpro-sheet.component';

@Component({
  selector: 'app-work-sheets',
  standalone: true,
  imports: [CommonModule, TrackingSheetComponent, CardproSheetComponent, ImagesComponent ],
  templateUrl: './work-sheets.component.html',
  styleUrl: './work-sheets.component.css'
})
export class WorkSheetsComponent implements OnInit {

  activeTab: string = 'CardPro Clients';
  
  tabs: string[] = ['CardPro Clients', 'Images', 'Tracking Sheet'];

  isCardProTabActive: boolean = true;
  isImagesTabActive: boolean = false;
  isTrackingTabActive: boolean = false;
  
  constructor(private filesService: FilesService, private imagesService: ImagesService, private trackingSheetService: TrackingSheetService, private cardProSheetService: CardProSheetService) {}

  ngOnInit(): void {
    this.filesService.trackingSheetEventSubject.subscribe((response) => {
      this.activeTab = 'Tracking Sheet'

      if(this.activeTab == 'Tracking Sheet'){
        this.trackingSheetService.getTrackingSheetClients(
          { pageNumber: 0, pageSize: 20, sortBy: "registrationYear", search: "", filter: ""}
        );
      }
    })

    this.filesService.imagesEventSubject.subscribe((response) => {
      this.activeTab = 'Images'

      if(this.activeTab == 'Images'){
        this.imagesService.getImages(
          { pageNumber: 0, pageSize: 20, sortBy: "id", search: "", filter: ""}
        );
      }
    })

    this.filesService.cardProSheetEventSubject.subscribe((response) => {
      this.activeTab = 'CardPro Clients'

      if(this.activeTab == 'CardPro Clients'){
        this.cardProSheetService.getCardProSheetClients(
          { pageNumber: 0, pageSize: 20, sortBy: "id", search: "", filter: ""}
        );
      }
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
