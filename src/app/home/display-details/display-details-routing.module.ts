import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayDetailsPage } from './display-details.page';

const routes: Routes = [
  {
    path: '',
    component: DisplayDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplayDetailsPageRoutingModule {}
