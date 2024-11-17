import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowReactionsComponent } from './show-reactions.component';

describe('ShowReactionsComponent', () => {
  let component: ShowReactionsComponent;
  let fixture: ComponentFixture<ShowReactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowReactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowReactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
