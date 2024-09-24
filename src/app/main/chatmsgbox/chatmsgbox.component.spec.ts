import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmsgboxComponent } from './chatmsgbox.component';

describe('ChatmsgboxComponent', () => {
  let component: ChatmsgboxComponent;
  let fixture: ComponentFixture<ChatmsgboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatmsgboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatmsgboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
