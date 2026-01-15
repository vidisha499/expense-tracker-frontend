import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddExpenseModalPage } from './add-expense-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddExpenseModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddExpenseModalPageRoutingModule {}
