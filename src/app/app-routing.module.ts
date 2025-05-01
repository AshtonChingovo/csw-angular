import { RouterModule, Routes } from '@angular/router';
import { TransactionsComponent } from './transactions/transactions.component';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CardproComponent } from './cardpro/cardpro.component';
import { RenewalsComponent } from './renewals/renewals.component';

const routes: Routes = [
  { path: '', component: CardproComponent },
  { path: 'renewals', component: RenewalsComponent },
  { path: 'transactions', component: TransactionsComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
})
export class AppRoutingModule {}
