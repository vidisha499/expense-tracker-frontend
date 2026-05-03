
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ProfileService } from '../../services/profile-service';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  standalone: false
})
export class SecurityPage implements OnInit {

  userId: string = localStorage.getItem('userId') || "";
  passwords = {
    oldPassword: '',
    newPassword: ''
  };
  showOldPassword = false;
  showNewPassword = false;

  constructor(
    private profileService: ProfileService,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    if (!this.userId) {
      this.navCtrl.navigateRoot('/home/login');
    }
  }

  updatePassword() {
    if (!this.userId) return;

    this.profileService.updatePassword(this.userId, this.passwords).subscribe({
      next: async (res: any) => {
        const alert = await this.alertCtrl.create({
          header: 'Security Updated',
          message: 'Your credentials have been successfully refreshed.',
          buttons: ['Excellent']
        });
        await alert.present();
        this.passwords = { oldPassword: '', newPassword: '' };
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Update Failed',
          message: 'Please ensure your current password is correct.',
          buttons: ['Try Again']
        });
        await alert.present();
      }
    });
  }

  async deleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Permanently Delete?',
      message: 'This action cannot be undone. All your financial records will be lost.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Delete Everything', 
          role: 'destructive',
          handler: () => {
            // Implementation for delete account would go here
            window.alert('Account deletion request submitted.');
          } 
        }
      ]
    });
    await alert.present();
  }
}
