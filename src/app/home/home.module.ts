import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonDatetime, IonicModule, IonModal, IonPopover } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,    
    IonicModule,
    FormsModule,
  
    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
