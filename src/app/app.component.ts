import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppService } from './apps.service';
import { CardproComponent } from './cardpro/cardpro.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, CardproComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isOAuthTokenCheckModalOpen = true;

  redirectURL = '';

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.appService.response.subscribe((response) => {
      if (response.isSuccessful) {
        // if response != Success then backend has sent OAuth redirect URL
        if (response.data.redirectUrl === 'Success') {
          this.isOAuthTokenCheckModalOpen = false;
        } else {
          this.redirectURL = response.data.redirectUrl;
        }
      }
    });

    this.appService.OAuthResponse.subscribe((response) => {
      if (response.isSuccessful) {
        this.isOAuthTokenCheckModalOpen = true;
        this.redirectURL = response.data.redirectUrl;
      } else {
        // make sure dialog is closed
        this.isOAuthTokenCheckModalOpen = false;
      }
    });

    // check the Google OAuthToken
    this.appService.checkOAuthToken();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    const formData = new FormData();

    formData.append('file', file);
  }

  closeModal() {
    this.isOAuthTokenCheckModalOpen = false;
  }
}
