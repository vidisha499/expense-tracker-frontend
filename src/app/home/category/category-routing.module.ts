import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { category } from './category.page';
import { HomePage } from '../home.page';

const routes: Routes = [
  {
    path: '',
    component: category,
  },
   {
    path: 'home',
    component: HomePage,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryPageRoutingModule {}
