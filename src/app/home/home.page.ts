import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AddExpenseModalPage } from './add-expense-modal/add-expense-modal.page';
import { Subscription } from 'rxjs';
import { ExpenseService, Expense } from '../services/expense-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  today = new Date();
  filterStartDate: string = new Date().toISOString();
  filterEndDate: string = new Date().toISOString();
  dateRangeActive: boolean = false;
  filter: 'all' | 'expense' | 'income' = 'all';
  expensesList: Expense[] = [];
    isModalOpen = false;
  private sub!: Subscription;

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public expenseService: ExpenseService
  ) {}

  ngOnInit() {
    this.sub = this.expenseService.expenses$.subscribe(data => {
      this.expensesList = data;
    });
    this.fetchExpenses();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  fetchExpenses() {
    this.expenseService.loadExpenses();
  }

  get totalExpense() {
    return this.filteredExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);
  }

  get totalIncome() {
    return this.filteredExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }

  async addExpense() {
    const modal = await this.modalCtrl.create({
      component: AddExpenseModalPage,
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
      date: new Date(data.date),
      type: data.type,
      remark: data.remark
    };
    this.expenseService.addExpense(expense);
  }

  async deleteExpense(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this record?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            const expenseId = this.filteredExpenses[index].id;
            if (expenseId) this.expenseService.deleteExpenseFromDB(expenseId);
          }
        }
      ]
    });
    await alert.present();
  }

  setFilter(type: 'expense' | 'income') {
    // If user clicks the active filter, return to 'all'
    this.filter = (this.filter === type) ? 'all' : type;
  }

  applyRangeFilter() {
    if (this.filterStartDate && this.filterEndDate) {
      this.dateRangeActive = true;
    }
  }

  clearRangeFilter() {
    this.filterStartDate = new Date().toISOString();
    this.filterEndDate = new Date().toISOString();
    this.dateRangeActive = false;
    this.filter = 'all';
  }

  get filteredExpenses() {
    let list = [...this.expensesList];
    if (this.filter !== 'all') {
      list = list.filter(e => e.type === this.filter);
    }
    if (this.dateRangeActive) {
      const start = new Date(this.filterStartDate).setHours(0, 0, 0, 0);
      const end = new Date(this.filterEndDate).setHours(23, 59, 59, 999);
      list = list.filter(e => {
        const entryDate = new Date(e.date).getTime();
        return entryDate >= start && entryDate <= end;
      });
    }
    return list;
  }



setOpen(isOpen: boolean) {
  this.isModalOpen = isOpen;
}
}
