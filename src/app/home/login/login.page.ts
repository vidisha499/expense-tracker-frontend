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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    private http: HttpClient
  ) {}

  ngOnInit() {
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

    const { email, password } = this.loginForm.value;

    this.http
      .post<any>(`${environment.apiUrl}/login`, { email, password })
      .subscribe({
        next: (res) => {
          console.log('✅ Login successful', res);

          // Save login details
          localStorage.setItem('userId', res.user.id);
          localStorage.setItem('email', res.user.email);

          // Navigate to home page
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('❌ Login failed', err);
          this.loginError = 'Invalid email or password';
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
}
