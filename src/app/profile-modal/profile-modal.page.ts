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
  isDarkMode: boolean = false; // Add this line
  
  userProfile: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private profileService: ProfileService
  ) { }

  // ngOnInit() {
  //   if (this.currentUserId) {
  //     this.loadData();
  //   }
  // }

  ngOnInit() {
    // Check if user previously chose dark mode
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.currentUserId) {
      this.loadData();
    }
  }

  toggleTheme(event: any) {
    this.isDarkMode = event.detail.checked;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  loadData() {
    this.profileService.getUserProfile(this.currentUserId).subscribe({
      next: (data: any) => {
        console.log("📥 Raw Data from DB:", data);
        
        // Ensure keys match and provide fallbacks to keep UI clean
        this.userProfile = {
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || ''
        };
        
        console.log("✅ Processed Profile Data:", this.userProfile);
      },
      error: (err) => console.error("❌ Error fetching profile", err)
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
    
    console.log("🚀 Synchronizing Data to DB:", this.userProfile);

    this.profileService.updateProfile(this.currentUserId, this.userProfile).subscribe({
      next: (res) => {
        console.log("✅ Server response:", res);
        this.modalCtrl.dismiss();
      },
      error: (err) => {
        console.error("❌ Update failed:", err);
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