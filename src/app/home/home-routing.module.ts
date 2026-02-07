import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { UploadPage } from '../pages/upload/upload.page';
import { ChartsPage } from '../pages/charts/charts.page';


const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path:'upload',
    component:UploadPage,
  },
  {
    path:'charts',
    component:ChartsPage,
  },
  {
    path: 'category',
    loadChildren: () => import('./category/category.module').then( m => m.CategoryPageModule)
  },
  {
    path: 'add-expense-modal',
    loadChildren: () => import('./add-expense-modal/add-expense-modal.module').then( m => m.AddExpenseModalPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: 'display-details',
    loadChildren: () => import('./display-details/display-details.module').then( m => m.DisplayDetailsPageModule)
  },

 
   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
