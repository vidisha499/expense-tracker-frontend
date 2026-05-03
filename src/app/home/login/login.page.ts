// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ExpenseService } from 'src/app/services/expense-service';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.page.html',
//   styleUrls: ['./login.page.scss'],
//   standalone: false,
// })
// export class LoginPage implements OnInit {
//   loginForm!: FormGroup;
//   loginError: string = '';
//   category: any;
//   title: any;
//    passwordType: string = 'password';
//   passwordIcon: string = 'eye-outline';

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private expenseService: ExpenseService,
//     private http: HttpClient
//   ) {}

//   ngOnInit() {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//     });
//   }


  


//   onLogin() {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }

//     const { email, password } = this.loginForm.value;

//     this.http
//       .post<any>('http://localhost:8008/login', { email, password })
//       .subscribe({
//         next: (res: any) => {
//           console.log('Login successful', res);

          
//           localStorage.setItem('userId', res.user.id);
//           localStorage.setItem('email', res.user.email);

//           this.router.navigate(['/home']);
//         },
//         error: (err: any) => {
//           console.error('Login failed', err);
//           alert('Invalid email or password');
//         },
//       });
//   }

//   onCancel() {
//     this.router.navigate(['/home']);
//   }

  
 

//   togglePassword() {
//     this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
//     this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
//   }
// }

import { Component, OnInit ,ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ExpenseService } from 'src/app/services/expense-service';
import { ProfileService } from 'src/app/services/profile-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  loginError: string = '';

  passwordType: string = 'password';
  passwordIcon: string = 'eye-outline';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private expenseService: ExpenseService,
    private profileService: ProfileService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Check if user is already logged in
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('✅ User session found, bypassing login.');
      this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email.toLowerCase().trim();
    const password = this.loginForm.value.password;

    console.log('🚀 Attempting Login with:', email);

    this.expenseService.login(email, password)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Login Response:', res);
          localStorage.setItem('userId', res.user.id);
          localStorage.setItem('email', res.user.email);
          
          // Trigger profile refresh immediately
          this.profileService.getUserProfile(res.user.id).subscribe();
          
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('❌ Login Error Details:', err);
          const status = err.status || 'Unknown';
          if (err.status === 0) {
            this.loginError = `Cannot connect to server (Code: ${status}). Check your internet.`;
          } else if (err.status === 401) {
            this.loginError = 'Invalid email or password.';
          } else {
            this.loginError = `Server Error (Code: ${status}): ${err.error?.message || 'Something went wrong'}`;
          }
          alert(this.loginError);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/home']);
  }

  togglePassword() {
    this.passwordType =
      this.passwordType === 'password' ? 'text' : 'password';

    this.passwordIcon =
      this.passwordIcon === 'eye-outline'
        ? 'eye-off-outline'
        : 'eye-outline';
  }

  async forgotPassword() {
    const alert1 = await this.alertCtrl.create({
      header: 'Forgot Password',
      message: 'Enter your registered mobile number.',
      cssClass: 'midnight-alert',
      inputs: [{ name: 'phone', type: 'tel', placeholder: 'Mobile Number' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Get OTP',
          handler: (data) => {
            if (data.phone) {
              this.requestOtp(data.phone);
            }
          }
        }
      ]
    });
    await alert1.present();
  }

  requestOtp(phone: string) {
    this.http.post(`${environment.apiUrl}/forgot-password/request`, { phone }).subscribe({
      next: (res: any) => {
        this.promptOtp(res.email, res.maskedEmail);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to send OTP.');
      }
    });
  }

  async promptOtp(email: string, maskedEmail: string) {
    const alert2 = await this.alertCtrl.create({
      header: 'Enter OTP',
      message: `OTP sent to ${maskedEmail}`,
      cssClass: 'midnight-alert',
      inputs: [{ name: 'otp', type: 'text', placeholder: '6-digit OTP' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Verify',
          handler: (data) => {
            if (data.otp) {
              this.verifyOtp(email, data.otp);
            }
          }
        }
      ]
    });
    await alert2.present();
  }

  verifyOtp(email: string, otp: string) {
    this.http.post(`${environment.apiUrl}/forgot-password/verify`, { email, otp }).subscribe({
      next: () => {
        this.promptNewPassword(email, otp);
      },
      error: (err) => {
        alert(err.error?.message || 'Invalid OTP.');
      }
    });
  }

  async promptNewPassword(email: string, otp: string) {
    const alert3 = await this.alertCtrl.create({
      header: 'Reset Password',
      message: 'Enter your new password.',
      cssClass: 'midnight-alert',
      inputs: [{ name: 'newPassword', type: 'password', placeholder: 'New Password' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          handler: (data) => {
            if (data.newPassword) {
              this.resetPassword(email, otp, data.newPassword);
            }
          }
        }
      ]
    });
    await alert3.present();
  }

  resetPassword(email: string, otp: string, newPassword: string) {
    this.http.post(`${environment.apiUrl}/forgot-password/reset`, { email, otp, newPassword }).subscribe({
      next: () => {
        alert('Password reset successfully! You can now login with your new password.');
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to reset password.');
      }
    });
  }
}
