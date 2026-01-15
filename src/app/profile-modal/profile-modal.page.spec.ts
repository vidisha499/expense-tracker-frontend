import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileModalPage } from './profile-modal.page';

describe('ProfileModalPage', () => {
  let component: ProfileModalPage;
  let fixture: ComponentFixture<ProfileModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
