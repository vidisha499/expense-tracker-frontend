import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ActionSheetController } from '@ionic/angular';
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
    profile_image: null
  };

  async uploadImage() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Profile Photo',
      buttons: [
        {
          text: 'Take Picture',
          icon: 'camera-outline',
          handler: () => {
            this.capturePhoto('CAMERA');
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.capturePhoto('PHOTOS');
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private async capturePhoto(sourceType: 'CAMERA' | 'PHOTOS') {
    try {
      const { Camera } = await import('@capacitor/camera');
      const { CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: sourceType === 'CAMERA' ? CameraSource.Camera : CameraSource.Photos
      });

      if (image && image.base64String) {
        this.userProfile.profile_image = `data:image/jpeg;base64,${image.base64String}`;
        console.log("📸 New Profile Image Captured");
      }
    } catch (err) {
      console.error("❌ Camera error:", err);
    }
  }

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
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
          phone: data.phone || '',
          profile_image: data.profile_image || null
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