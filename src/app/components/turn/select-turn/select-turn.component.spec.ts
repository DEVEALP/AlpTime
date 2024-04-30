import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTurnComponent } from './select-turn.component';

describe('SelectTurnComponent', () => {
  let component: SelectTurnComponent;
  let fixture: ComponentFixture<SelectTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
