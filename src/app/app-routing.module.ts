import { RouterModule, Routes } from '@angular/router';
import { TransactionsComponent } from './transactions/transactions.component';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CardproComponent } from './cardpro/cardpro.component';

const routes: Routes = [
  { path: '', component: CardproComponent },
  { path: 'transactions', component: TransactionsComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
})
export class AppRoutingModule {}
