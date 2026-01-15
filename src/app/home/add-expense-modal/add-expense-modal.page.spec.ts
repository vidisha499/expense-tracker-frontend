import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddExpenseModalPage } from './add-expense-modal.page';

describe('AddExpenseModalPage', () => {
  let component: AddExpenseModalPage;
  let fixture: ComponentFixture<AddExpenseModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExpenseModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
