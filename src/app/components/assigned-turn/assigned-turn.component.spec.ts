import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedTurnComponent } from './assigned-turn.component';

describe('AssignedTurnComponent', () => {
  let component: AssignedTurnComponent;
  let fixture: ComponentFixture<AssignedTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedTurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
