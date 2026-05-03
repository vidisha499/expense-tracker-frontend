import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileModalPage } from './profile-modal/profile-modal.page';
import { ProfileService } from './services/profile-service';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  userName: string = 'User';


  constructor(private router: Router,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private profileService: ProfileService
  ) {

    this.initializeApp();
    this.subscribeToProfile();
    this.loadUserData();
  }

  // initializeApp() {
  //   // 1. Check if the user has a saved preference in localStorage
  //   const savedTheme = localStorage.getItem('theme');
    
  //   // 2. If 'dark' is saved, add the class to the body
  //   if (savedTheme === 'dark') {
  //     document.body.classList.add('dark');
  //   } else {
  //     // Otherwise, ensure it stays in light mode
  //     document.body.classList.remove('dark');
  //   }
  // }

  initializeApp() {
  const savedTheme = localStorage.getItem('theme');
  
  // If no theme is saved, or it's set to 'light', ensure 'dark' class is GONE
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    // Optional: explicitly set light if you want to be 100% sure
    localStorage.setItem('theme', 'light');
  }
}

loadUserData() {
  const userId = localStorage.getItem('userId');
  if (userId) {
    this.profileService.getUserProfile(userId).subscribe({
      next: (data: any) => {
        if (data && data.first_name) {
          this.userName = data.first_name;
        }
      },
      error: (err) => console.error('Error loading user data:', err)
    });
  }
}

subscribeToProfile() {
  this.profileService.profile$.subscribe(data => {
    if (data && data.first_name) {
      this.userName = data.first_name;
    }
  });
}


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

  async triggerChangePassword() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const alertElement = await this.alertCtrl.create({
      header: 'Change Security Key',
      subHeader: 'Update your access password',
      cssClass: 'midnight-alert',
      inputs: [
        { name: 'oldPassword', type: 'password', placeholder: 'Current Password' },
        { name: 'newPassword', type: 'password', placeholder: 'New Password' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Update Now', 
          handler: (data) => {
            this.profileService.updatePassword(userId, data).subscribe({
              next: () => window.alert('Security updated successfully!'),
              error: () => window.alert('Failed to update security credentials. Ensure current password is correct.')
            });
          } 
        }
      ]
    });
    await alertElement.present();
  }
}


