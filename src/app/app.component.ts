import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { ProfileModalPage } from './profile-modal/profile-modal.page';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {



  constructor(private router: Router,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController
  ) {}


 async openProfileModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalPage, 
    });
    return await modal.present();
  }

  
logout() {
   
    localStorage.removeItem('userId');
    localStorage.removeItem('email');

  
    this.menuCtrl.close();

   
    this.router.navigate(['/home/login'], { replaceUrl: true });

    console.log('User session cleared. Data remains safe in MySQL.');
  }
}


