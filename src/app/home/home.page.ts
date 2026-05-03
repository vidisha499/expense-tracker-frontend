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
  timeFilter: 'all' | 'week' | 'month' | 'custom' = 'all';
  isModalOpen = false;
  isStartDateOpen = false;
  isEndDateOpen = false;
  expensesList: Expense[] = [];
  groupedExpenses: { title: string, items: Expense[] }[] = [];
  insightMessage: string = "You're on track! You've saved ₹1,200 more than last week.";
  private sub!: Subscription;

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public expenseService: ExpenseService
  ) {}

  setFilter(type: 'expense' | 'income') {
    this.filter = (this.filter === type) ? 'all' : type;
  }

  ngOnInit() {
    this.sub = this.expenseService.expenses$.subscribe(data => {
      this.expensesList = data;
      this.groupTransactions();
      this.generateInsight();
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
      remark: data.remark,
      bills: data.bills || [] // Passing the bills array
    };
    this.expenseService.addExpense(expense);
  }

  async editExpense(expense: Expense) {
    const modal = await this.modalCtrl.create({
      component: AddExpenseModalPage,
      componentProps: {
        existingExpense: expense
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (!data) return;

    const isExpense = data.type === 'expense';
    const updated: Expense = {
      ...expense,
      expenseName: data.expenseName,
      expenseHead: data.expenseHead,
      amount: isExpense ? -Math.abs(+data.amount) : +data.amount,
      paymentMode: data.paymentMode,
      expenseDoneBy: data.expenseDoneBy,
      date: new Date(data.date),
      type: data.type,
      remark: data.remark,
      bills: data.bills || [] // Passing the bills array
    };
    this.expenseService.updateExpense(updated);
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

  onPeriodChange(event: any) {
    this.timeFilter = event.detail.value;
    if (this.timeFilter !== 'custom') {
      this.dateRangeActive = false;
    }
  }

  openStartDatePicker() { this.isStartDateOpen = true; }
  openEndDatePicker() { this.isEndDateOpen = true; }

  onDateRangeChange() {
    this.dateRangeActive = true;
    // Auto-close popovers after selection
    this.isStartDateOpen = false;
    this.isEndDateOpen = false;
    this.groupTransactions();
  }

  resetCustomDates() {
    this.filterStartDate = new Date().toISOString();
    this.filterEndDate = new Date().toISOString();
    this.dateRangeActive = false;
    this.timeFilter = 'all';
  }

  get filteredExpenses() {
    let list = [...this.expensesList];
    if (this.filter !== 'all') {
      list = list.filter(e => e.type === this.filter);
    }

    const now = new Date();
    if (this.timeFilter === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0,0,0,0);
      list = list.filter(e => new Date(e.date).getTime() >= startOfWeek);
    } else if (this.timeFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      list = list.filter(e => new Date(e.date).getTime() >= startOfMonth);
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

  groupTransactions() {
    const groups: { [key: string]: Expense[] } = {};
    const today = new Date().setHours(0,0,0,0);
    const yesterday = new Date(Date.now() - 86400000).setHours(0,0,0,0);

    this.filteredExpenses.forEach(e => {
      const d = new Date(e.date).setHours(0,0,0,0);
      let key = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (d === today) key = 'Today';
      else if (d === yesterday) key = 'Yesterday';

      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    this.groupedExpenses = Object.keys(groups).map(key => ({
      title: key,
      items: groups[key]
    })).sort((a, b) => {
      if (a.title === 'Today') return -1;
      if (b.title === 'Today') return 1;
      if (a.title === 'Yesterday') return -1;
      if (b.title === 'Yesterday') return 1;
      return new Date(b.items[0].date).getTime() - new Date(a.items[0].date).getTime();
    });
  }

  generateInsight() {
    const total = this.totalExpense;
    if (total > 5000) {
      this.insightMessage = "Spending is a bit high this week. Consider cutting back on dining.";
    } else if (total === 0) {
      this.insightMessage = "No spending yet! Great start to your financial journey.";
    } else {
      this.insightMessage = "You're on track! You've saved more than your average this week.";
    }
  }

  async quickAdd(category: string) {
    const alert = await this.alertCtrl.create({
      header: `Enter ${category} Amount`,
      cssClass: 'midnight-alert',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount in ₹'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add Expense',
          handler: (data) => {
            if (data.amount && data.amount > 0) {
              const expense: Expense = {
                expenseName: category,
                expenseHead: category,
                amount: -Math.abs(+data.amount),
                paymentMode: 'online',
                expenseDoneBy: 'self',
                date: new Date(),
                type: 'expense',
                remark: `Quick add ${category}`
              };
              this.expenseService.addExpense(expense);
            }
          }
        }
      ]
    });
    await alert.present();
  }



setOpen(isOpen: boolean) {
  this.isModalOpen = isOpen;
}
}
