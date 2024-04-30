import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveTurnComponent } from './move-turn.component';

describe('MoveTurnComponent', () => {
  let component: MoveTurnComponent;
  let fixture: ComponentFixture<MoveTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveTurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
