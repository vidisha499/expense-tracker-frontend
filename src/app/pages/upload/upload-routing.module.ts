import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadPage } from './upload.page';
import { ChartsPage } from '../charts/charts.page';

const routes: Routes = [
  {
    path: '',
    component: UploadPage
  },
  {
    path: 'charts',
    component: ChartsPage,
  },
   {
    path:'upload',
    component:UploadPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadPageRoutingModule {}
