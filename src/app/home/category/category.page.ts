import { Component, inject, OnInit } from '@angular/core';
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
  selectedType: 'expense' | 'income' = 'expense';
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

  get filteredCategories(): Category[] {
    return this.categories.filter((c) => c.type === this.selectedType);
  }

  async addNewCustomCategory() {
    const alert = await this.alertCtrl.create({
      header: 'New Category',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Category Name (e.g. Gym)' }],
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
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async openCategoryPopup(category: Category) {
    if (category.name === 'Others') {
      await this.addNewCustomCategory();
    } else {
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
  }

  // async showAmountInput(category: Category) {
  //   const modal = await this.modalCtrl.create({
  //     component: AddExpenseModalPage,
  //     // PASS DATA TO MODAL HERE
  //     componentProps: { 
  //       preSelectedCategory: category.name,
  //       preSelectedType: this.selectedType 
  //     },
  //   });

  //   await modal.present();
  //   const { data } = await modal.onWillDismiss();
  //   if (!data) return;

  //   const isExpense = data.type === 'expense';
  //   const expense: Expense = {
  //     expenseName: data.expenseName,
  //     expenseHead: data.expenseHead || 'Others',
  //     amount: isExpense ? -Math.abs(+data.amount) : +data.amount,
  //     paymentMode: data.paymentMode,
  //     expenseDoneBy: data.expenseDoneBy || 'self',
  //     date: new Date(data.date),
  //     type: data.type,
  //     remark: data.remark
  //   };
  //   this.expenseService.addExpense(expense);
  // }

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

  const isExpense = data.type === 'expense';
  
  
  const expense: Expense = {
    expenseName: data.expenseName,
    expenseHead: data.expenseHead || 'Others',
    amount: isExpense ? -Math.abs(+data.amount) : +data.amount,
    paymentMode: data.paymentMode,
    expenseDoneBy: data.expenseDoneBy || 'self',
    otherPerson: data.otherPerson, 
    date: new Date(data.date),
    type: data.type,
    remark: data.remark,
    bills: data.bills 
  };
  
  this.expenseService.addExpense(expense);
}

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
}