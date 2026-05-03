import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ExpenseService } from 'src/app/services/expense-service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;
  signupError: string = '';
  passwordType: string = 'password';
  passwordIcon: string = 'eye-outline';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private expenseService: ExpenseService
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSignup() {
    console.log('--- onSignup Called ---');
    console.log('Form Valid:', this.signupForm.valid);
    console.log('Form Values:', this.signupForm.value);

    if (this.signupForm.invalid) {
      console.log('❌ Form is invalid');
      this.signupForm.markAllAsTouched();
      
      // Simple alert to help user see what is wrong
      if (this.signupForm.get('email')?.errors) alert('Please enter a valid email address.');
      else if (this.signupForm.get('mobileNumber')?.errors) alert('Mobile number must be exactly 10 digits.');
      else if (this.signupForm.get('password')?.errors) alert('Password must be at least 6 characters.');
      else if (this.signupForm.errors?.['mismatch']) alert('Passwords do not match.');
      else alert('Please fill all required fields correctly.');
      
      return;
    }

    const { firstName, lastName, mobileNumber, password } = this.signupForm.value;
    const normalizedEmail = this.signupForm.value.email.toLowerCase().trim();

    console.log('🚀 Sending Register Request...');
    this.expenseService.register(firstName, lastName, normalizedEmail, mobileNumber, password).subscribe({
      next: (res: any) => {
        console.log('✅ Signup successful', res);
        alert('Signup successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Signup failed', err);
        this.signupError = err.error?.message || 'Signup failed. Please try again.';
        alert(this.signupError);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }
}
