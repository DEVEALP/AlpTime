import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarUserRecordsComponent } from './calendar-user-records.component';

describe('CalendarUserRecordsComponent', () => {
  let component: CalendarUserRecordsComponent;
  let fixture: ComponentFixture<CalendarUserRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarUserRecordsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarUserRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
