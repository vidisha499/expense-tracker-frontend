import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService, Expense } from '../../services/expense-service';

@Component({
  selector: 'app-display-details',
  templateUrl: './display-details.page.html',
  styleUrls: ['./display-details.page.scss'],
  standalone: false,
})
export class DisplayDetailsPage implements OnInit {

  images: string[] = [];
  expense: any; 
  index!: number;

  constructor(
    private route: ActivatedRoute,
    private expenseService: ExpenseService
  ) {}

  ngOnInit() {
    // 1. Get the index from the URL parameters
    const indexParam = this.route.snapshot.paramMap.get('index');
    
    if (indexParam !== null) {
      this.index = Number(indexParam);

      // 2. Subscribe to the expenses list from the service
      this.expenseService.expenses$.subscribe(data => {
        // 3. Find the specific expense using the index
        if (data && data[this.index]) {
          this.expense = data[this.index];
          
          /** * IMPORTANT: We assign the 'bills' array to 'images'.
           * This matches the variable used in your HTML *ngFor="let img of images".
           */
          this.images = this.expense.bills || [];
          
          console.log('Successfully loaded expense data:', this.expense);
          console.log('Attachments found:', this.images.length);
        } else {
          console.warn('No expense found at index:', this.index);
        }
      });
    }
  }
}