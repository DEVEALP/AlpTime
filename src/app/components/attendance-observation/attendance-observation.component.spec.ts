import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceObservationComponent } from './attendance-observation.component';

describe('AttendanceObservationComponent', () => {
  let component: AttendanceObservationComponent;
  let fixture: ComponentFixture<AttendanceObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceObservationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
