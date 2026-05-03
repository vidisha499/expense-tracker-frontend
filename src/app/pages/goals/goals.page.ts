
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Goal, GoalService } from '../../services/goal-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: false
})
export class GoalsPage implements OnInit {
  goals$: Observable<Goal[]>;

  constructor(
    private goalService: GoalService,
    private alertCtrl: AlertController
  ) {
    this.goals$ = this.goalService.goals$;
  }

  ngOnInit() {}

  getEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      'Travel': '✈️',
      'Gadgets': '📱',
      'Vehicle': '🚗',
      'Home': '🏠',
      'Emergency': '🛡️',
      'Others': '✨'
    };
    return emojis[category] || '✨';
  }

  async openAddGoal() {
    const alert = await this.alertCtrl.create({
      header: 'New Savings Goal',
      cssClass: 'midnight-alert',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'What are you saving for?' },
        { name: 'amount', type: 'number', placeholder: 'Target Amount (₹)' },
        { name: 'category', type: 'text', placeholder: 'Category (Travel, Gadgets, etc.)' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Start Saving',
          handler: (data) => {
            if (data.name && data.amount) {
              this.goalService.addGoal({
                name: data.name,
                targetAmount: +data.amount,
                currentAmount: 0,
                category: data.category || 'Others'
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async addMoney(goal: Goal) {
    const alert = await this.alertCtrl.create({
      header: `Add to ${goal.name}`,
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Amount to add (₹)' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.amount && goal.id) {
              this.goalService.updateGoalAmount(goal.id, +data.amount);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  deleteGoal(id?: string) {
    if (id) this.goalService.deleteGoal(id);
  }
}
