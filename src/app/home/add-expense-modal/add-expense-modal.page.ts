import { Component, OnInit, Input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { category } from '../category/category.page'; 

@Component({
  selector: 'app-add-expense-modal',
  templateUrl: './add-expense-modal.page.html',
  styleUrls: ['./add-expense-modal.page.scss'],
  
  standalone: false,
})
export class AddExpenseModalPage implements OnInit {
  
  @Input() preSelectedCategory: string = '';
  @Input() preSelectedType: 'expense' | 'income' = 'expense';
  @Input() existingExpense: any = null;

  expenseForm!: FormGroup;
  images: string[] = [];
  today = new Date().toISOString();
  selectedType: 'expense' | 'income' = 'expense';

  constructor(private modalCtrl: ModalController, private fb: FormBuilder, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.selectedType = this.existingExpense ? this.existingExpense.type : this.preSelectedType;

    this.expenseForm = this.fb.group({
      expenseName: [this.existingExpense ? this.existingExpense.expenseName : this.preSelectedCategory, Validators.required],
      expenseHead: [this.existingExpense ? this.existingExpense.expenseHead : '', Validators.required],
      expenseDoneBy: [this.existingExpense ? this.existingExpense.expenseDoneBy : (this.selectedType === 'income' ? 'self' : ''), this.selectedType === 'expense' ? Validators.required : null],
      otherPerson: [this.existingExpense ? this.existingExpense.otherPerson : ''],
      date: [this.existingExpense ? new Date(this.existingExpense.date).toISOString() : this.today, Validators.required],
      amount: [this.existingExpense ? Math.abs(this.existingExpense.amount) : '', [Validators.required, Validators.min(0.01)]],
      paymentMode: [this.existingExpense ? this.existingExpense.paymentMode : 'cash', Validators.required],
      category: [this.existingExpense ? this.existingExpense.expenseHead : this.preSelectedCategory],
      remark: [this.existingExpense ? this.existingExpense.remark : '']
    });
    
    if (this.existingExpense && this.existingExpense.bills) {
      this.images = [...this.existingExpense.bills];
    }

    // Handle conditional mandatory field for "Others"
    this.expenseForm.get('expenseDoneBy')?.valueChanges.subscribe(value => {
      const otherCtrl = this.expenseForm.get('otherPerson');
      if (value === 'others') {
        otherCtrl?.setValidators([Validators.required]);
      } else {
        otherCtrl?.clearValidators();
        otherCtrl?.setValue('');
      }
      otherCtrl?.updateValueAndValidity();
    });
  }


  async openCategoryPage() {
  const modal = await this.modalCtrl.create({
    component: category,
    componentProps: { 
      isSelectionMode: true,
      selectedType: this.selectedType // Passing the form's current type (expense/income)
    }
  });

  await modal.present();
  const { data } = await modal.onWillDismiss();
  
  if (data) {
    this.expenseForm.patchValue({
      category: data.name,
      expenseName: data.name
    });
  }
}

  onTypeChange(event: any) {
    this.selectedType = event.detail.value;
    this.expenseForm.patchValue({ type: this.selectedType });
    
    if (this.selectedType === 'income') {
      this.expenseForm.get('expenseDoneBy')?.clearValidators();
    } else {
      this.expenseForm.get('expenseDoneBy')?.setValidators([Validators.required]);
    }
    this.expenseForm.get('expenseDoneBy')?.updateValueAndValidity();
  }

  close() { this.modalCtrl.dismiss(null, 'cancel'); }
  onCancel() { this.close(); }

  onOk() {
    if (this.expenseForm.valid) {
      const data = {
        ...this.expenseForm.value,
        type: this.selectedType, 
        bills: this.images
      };
      this.modalCtrl.dismiss(data, 'confirm'); 
    }
  }

  async uploadImage() {
    if (this.images.length >= 5) return;
    try {
      const photo = await Camera.getPhoto({
        quality: 40, 
        allowEditing: false, 
        source: CameraSource.Prompt, 
        resultType: CameraResultType.DataUrl
      });
      
      if (photo.dataUrl) {
        // Extreme Resizing for Render (800px max)
        const resized = await this.resizeImage(photo.dataUrl, 800, 800);
        const sizeInKB = Math.round((resized.length * 3/4) / 1024);
        console.log(`📸 Final Optimized Image Size: ${sizeInKB} KB`);
        this.images.push(resized);
      }
    } catch (error) {
      console.log('Camera cancelled or error:', error);
    }
  }

  resizeImage(base64Str: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Extremely low quality for Render compatibility
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
    });
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      cssClass: 'midnight-toast'
    });
    await toast.present();
  }

  removeImage(index: number) { this.images.splice(index, 1); }
}