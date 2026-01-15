import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Expense {
  id?: number;
  title?: string;
  expenseName?: string;
  expenseHead?: string;
  bills?: string[];
  amount: number;
  paymentMode?: 'cash' | 'online';
  type: 'expense' | 'income';
  expenseDoneBy?: 'self' | 'company' | 'others';
  otherPerson?: string;
  date: Date;
  category?: string;    
  remark?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private API_URL = 'http://localhost:8008/expenses';
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();

 
  private defaultCategories = [
    { id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', type: 'expense', isDefault: true },
    { id: 2, name: 'Food & Dining', icon: 'restaurant-outline', type: 'expense' },
    { id: 3, name: 'Shopping', icon: 'cart-outline', type: 'expense' },
    { id: 4, name: 'Travel', icon: 'navigate-outline', type: 'expense' },
    { id: 5, name: 'Entertainment', icon: 'game-controller-outline', type: 'expense' },
    { id: 6, name: 'Medical', icon: 'heart-outline', type: 'expense' },
    { id: 7, name: 'Personal Care', icon: 'cut-outline', type: 'expense' },
    { id: 8, name: 'Education', icon: 'school-outline', type: 'expense' },
    
    { id: 101, name: 'Salary', icon: 'cash-outline', type: 'income', isDefault: true },
    { id: 102, name: 'Business', icon: 'briefcase-outline', type: 'income' },
    { id: 103, name: 'Freelance', icon: 'laptop-outline', type: 'income' },
    { id: 104, name: 'Others', icon: 'ellipsis-horizontal-outline', type: 'income', isDefault: true },
  ];

  private categoriesSubject = new BehaviorSubject<any[]>(this.loadCategoriesFromStorage());
  categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadExpenses();
  }

  private loadCategoriesFromStorage() {
    const saved = localStorage.getItem('app_categories');
    return saved ? JSON.parse(saved) : this.defaultCategories;
  }

  saveCategories(categories: any[]) {
    localStorage.setItem('app_categories', JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }
  // ----------------------------------

  private getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  loadExpenses() {
    const userId = this.getUserId();
    if (!userId) return;

    this.http.get<any[]>(`${this.API_URL}?user_id=${userId}`).subscribe({
      next: (res) => {
        const parsed: Expense[] = res.map(e => ({
          id: e.id,
          expenseName: e.expense_name,
          title: e.title,
          expenseHead: e.category,
          bills: e.bills,
          amount: e.amount,
          paymentMode: e.payment_mode,
          expenseDoneBy: e.expense_done_by,
          otherPerson: e.otherPerson,
          date: new Date(e.expense_date),
          type: e.amount < 0 ? 'expense' : 'income',
          remark: e.remark 
        }));
        this.expensesSubject.next(parsed);
      },
      error: err => console.error('Failed to load expenses', err)
    });
  }

  addExpense(expense: Expense): void {
    const userId = this.getUserId();
    if (!userId) return;

    const updated = [expense, ...this.expensesSubject.value];
    this.expensesSubject.next(updated);

    this.http.post(this.API_URL, {
      user_id: userId,
      expense_name: expense.expenseName,
      amount: expense.amount,
      expense_done_by: expense.expenseDoneBy,
      category: expense.expenseHead,
      expense_date: expense.date.toISOString().split('T')[0],
      payment_mode: expense.paymentMode,
      remark: expense.remark 
    }).subscribe({
      next: (res: any) => {
        if (res && res.id) {
          const current = this.expensesSubject.value.filter(e => e !== expense);
          this.expensesSubject.next([{ ...expense, id: res.id }, ...current]);
        }
      },
      error: err => this.loadExpenses()
    });
  }

  deleteExpenseFromDB(id: number): void {
    const updated = this.expensesSubject.value.filter(e => e.id !== id);
    this.expensesSubject.next(updated);

    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => {},
      error: err => console.error('Failed to delete expense', err)
    });
  }

  getTotalIncome() {
    return this.expensesSubject.value
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalExpenses() {
    return this.expensesSubject.value
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  }

  getExpenseChartData() {
    const categoryMap: { [key: string]: number } = {};
    this.expensesSubject.value.forEach(exp => {
      const key = exp.title || exp.expenseName || 'Others';
      categoryMap[key] = (categoryMap[key] || 0) + Math.abs(exp.amount);
    });
    return {
      labels: Object.keys(categoryMap),
      values: Object.values(categoryMap),
      colors: Object.keys(categoryMap).map((_, i) => this.generateColor(i))
    };
  }

  private generateColor(index: number): string {
    const palette = ['#7b5cff', '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'];
    return palette[index % palette.length];
  }

  login(username: string, password: string) {
    return this.http.post<{ id: number; username: string }>(
      'http://localhost:8008/login', { username, password }
    );
  }

  clearData() {
    this.expensesSubject.next([]);
  }
}