import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnsAssingViewComponent } from './turns-assing-view.component';

describe('TurnsAssingViewComponent', () => {
  let component: TurnsAssingViewComponent;
  let fixture: ComponentFixture<TurnsAssingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurnsAssingViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnsAssingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
