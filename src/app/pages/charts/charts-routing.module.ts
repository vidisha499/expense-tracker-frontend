import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartsPage } from './charts.page';
import { UploadPage } from '../upload/upload.page';

const routes: Routes = [
  {
    path: '',
    component: ChartsPage,
  },
    {
      path:'upload',
      component: UploadPage,
    },
    {
      path:'charts',
      component:ChartsPage,
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChartsPageRoutingModule {}
