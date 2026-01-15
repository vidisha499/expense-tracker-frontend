import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DisplayDetailsPage } from './display-details.page';
import { DisplayDetailsPageRoutingModule } from './display-details-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisplayDetailsPageRoutingModule
  ],
  declarations: [DisplayDetailsPage]
})
export class DisplayDetailsPageModule {}
