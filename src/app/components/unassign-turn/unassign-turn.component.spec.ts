import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignTurnComponent } from './unassign-turn.component';

describe('UnassignTurnComponent', () => {
  let component: UnassignTurnComponent;
  let fixture: ComponentFixture<UnassignTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnassignTurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnassignTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
