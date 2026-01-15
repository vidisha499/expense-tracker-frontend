import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoryPageRoutingModule } from './category-routing.module';


import { category } from './category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryPageRoutingModule
  ],
  declarations: [category]
})
export class CategoryPageModule {}

export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  isDefault?: boolean;
}

