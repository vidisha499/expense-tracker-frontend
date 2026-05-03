
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Goal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private goals: Goal[] = JSON.parse(localStorage.getItem('user_goals') || '[]');
  private goalsSubject = new BehaviorSubject<Goal[]>(this.goals);
  goals$ = this.goalsSubject.asObservable();

  constructor() { }

  private save() {
    localStorage.setItem('user_goals', JSON.stringify(this.goals));
    this.goalsSubject.next([...this.goals]);
  }

  addGoal(goal: Goal) {
    goal.id = Date.now().toString();
    this.goals.push(goal);
    this.save();
  }

  updateGoalAmount(id: string, amount: number) {
    const goal = this.goals.find(g => g.id === id);
    if (goal) {
      goal.currentAmount += amount;
      this.save();
    }
  }

  deleteGoal(id: string) {
    this.goals = this.goals.filter(g => g.id !== id);
    this.save();
  }
}
