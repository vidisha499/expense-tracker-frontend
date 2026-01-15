import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayDetailsPage } from './display-details.page';

describe('DisplayDetailsPage', () => {
  let component: DisplayDetailsPage;
  let fixture: ComponentFixture<DisplayDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
