import { Component, inject, OnInit, Input } from '@angular/core';
import { Category } from './category.module';
import { Router } from '@angular/router';
import { ExpenseService, Expense } from 'src/app/services/expense-service';
import { AlertController, ModalController } from '@ionic/angular';
import { AddExpenseModalPage } from '../add-expense-modal/add-expense-modal.page';

@Component({
  selector: 'app-categories',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: false,
})
export class category implements OnInit {
  private router = inject(Router);
  
  // Inputs to handle selection mode from Add Expense Modal
  @Input() isSelectionMode: boolean = false;
  @Input() selectedType: 'expense' | 'income' = 'expense';

  categories: Category[] = [];

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private expenseService: ExpenseService
  ) {}

  ngOnInit() {
    this.expenseService.categories$.subscribe(data => {
      this.categories = data;
    });
  }

  // Filters categories based on the current type (Expense/Income)
  get filteredCategories(): Category[] {
    return this.categories.filter((c) => c.type === this.selectedType);
  }

  async openCategoryPopup(category: Category) {
    // 1. Handle "Add Category" (formerly Others)
    if (category.name === 'Others' || category.name === 'Add Category') {
      await this.addNewCustomCategory();
      return;
    }

    // 2. Handle Selection Mode (Return to Add Expense Modal)
    if (this.isSelectionMode) {
      this.modalCtrl.dismiss(category);
      return;
    }

    // 3. Handle Normal Mode (Show Action Alert)
    const alert = await this.alertCtrl.create({
      header: category.name,
      message: 'Choose an action',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'alert-danger',
          handler: () => { this.confirmDelete(category); }
        },
        {
          text: 'Add Transaction',
          handler: () => { this.showAmountInput(category); }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async addNewCustomCategory() {
    const alert = await this.alertCtrl.create({
      header: `New ${this.selectedType} Category`,
      inputs: [{ name: 'name', type: 'text', placeholder: 'Category Name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.name) return false;
            const newCat: Category = {
              id: Date.now(),
              name: data.name,
              icon: 'apps-outline', 
              type: this.selectedType
            };
            const updatedCategories = [...this.categories, newCat];
            this.expenseService.saveCategories(updatedCategories);
            
            if (this.isSelectionMode) {
              this.modalCtrl.dismiss(newCat);
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  // FIX: Added the missing showAmountInput method
  async showAmountInput(category: Category) {
    const modal = await this.modalCtrl.create({
      component: AddExpenseModalPage,
      componentProps: { 
        preSelectedCategory: category.name,
        preSelectedType: this.selectedType 
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (!data) return;

    const expense: Expense = {
      ...data,
      date: new Date(data.date),
      amount: data.type === 'expense' ? -Math.abs(+data.amount) : +data.amount,
    };
    
    this.expenseService.addExpense(expense);
  }

  // FIX: Added the missing confirmDelete method
  async confirmDelete(category: Category) {
    if (category.isDefault) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Cannot Delete',
        message: 'Default categories cannot be removed.',
        buttons: ['OK']
      });
      await errorAlert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${category.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            const updated = this.categories.filter(c => c.id !== category.id);
            this.expenseService.saveCategories(updated);
          }
        }
      ]
    });
    await alert.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  goBack() {
    this.router.navigate(['home']);
  }
}