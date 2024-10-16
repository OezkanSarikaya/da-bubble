import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUserProfileComponent } from './popup-user-profile.component';

describe('PopupUserProfileComponent', () => {
  let component: PopupUserProfileComponent;
  let fixture: ComponentFixture<PopupUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupUserProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PopupUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
