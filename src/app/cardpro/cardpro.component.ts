import { Component } from '@angular/core';
import { FileUploadsDownloadsComponent } from "./file-uploads-downloads/file-uploads-downloads.component";
import { WorkSheetsComponent } from "./work-sheets/work-sheets.component";

@Component({
  selector: 'app-cardpro',
  standalone: true,
  imports: [ FileUploadsDownloadsComponent, WorkSheetsComponent],
  templateUrl: './cardpro.component.html',
  styleUrl: './cardpro.component.css'
})
export class CardproComponent {

  activeTab: string = 'CardPro Clients';
  tabs: string[] = ['CardPro Clients', 'Images', 'Tracking Sheet'];

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

}
