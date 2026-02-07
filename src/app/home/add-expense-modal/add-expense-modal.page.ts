import { Component, OnInit, Input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
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

  expenseForm!: FormGroup;
  images: string[] = [];
  today = new Date().toISOString();
  selectedType: 'expense' | 'income' = 'expense';

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {}

  ngOnInit() {
    this.selectedType = this.preSelectedType;

    this.expenseForm = this.fb.group({
      expenseName: [this.preSelectedCategory, Validators.required],
      expenseHead: ['', Validators.required],
      
      expenseDoneBy: [this.selectedType === 'income' ? 'self' : '', this.selectedType === 'expense' ? Validators.required : null],
      otherPerson: [''],
      date: [this.today, Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentMode: ['cash', Validators.required],
      category: [this.preSelectedCategory], // Pre-filled with category name
      remark: ['']
    });

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
    const photo = await Camera.getPhoto({
      quality: 90, allowEditing: true, source: CameraSource.Prompt, resultType: CameraResultType.Uri
    });
    if (photo.webPath) this.images.push(photo.webPath);
  }

  removeImage(index: number) { this.images.splice(index, 1); }
}