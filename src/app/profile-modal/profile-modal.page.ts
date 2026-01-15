import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ProfileService } from '../services/profile-service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.page.html',
  styleUrls: ['./profile-modal.page.scss'],
  standalone: false,  
})
export class ProfileModalPage implements OnInit {

  currentUserId: string = localStorage.getItem('userId') || ""; 
  
  userProfile: any = {
    email: '',
    phone: '',
    bio: '',
    darkMode: false,
    notifications: true
  };

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    if (this.currentUserId) {
      this.loadData();
    }
  }

  loadData() {
    this.profileService.getUserProfile(this.currentUserId).subscribe({
      next: (data: any) => {
        this.userProfile = data;
        console.log("Data reflected for user:", this.currentUserId);
      },
      error: (err) => console.error("Error fetching profile", err)
    });
  }

 
  updatePreference(field: string, event: any) {
    this.userProfile[field] = event.detail.checked;
    console.log(`${field} changed to:`, event.detail.checked);
  }

  exit() {
    this.modalCtrl.dismiss();
  }

  saveAndClose() {
    if (!this.currentUserId) return;

    this.profileService.updateProfile(this.currentUserId, this.userProfile).subscribe({
      next: () => {
        this.modalCtrl.dismiss();
      },
      error: (err) => {
        const msg = err.error?.message || 'Update failed';
        window.alert(msg); 
      }
    });
  }

  
  async changePassword() {
    const alertElement = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        { name: 'oldPassword', type: 'password', placeholder: 'Current Password' },
        { name: 'newPassword', type: 'password', placeholder: 'New Password' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Update', 
          handler: (data) => {
            this.profileService.updatePassword(this.currentUserId, data).subscribe({
              next: () => window.alert('Password updated successfully!'),
              error: () => window.alert('Failed to update password.')
            });
          } 
        }
      ]
    });
    await alertElement.present();
  }
}