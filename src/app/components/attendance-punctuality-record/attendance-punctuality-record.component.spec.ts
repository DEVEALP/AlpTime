import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancePunctualityRecordComponent } from './attendance-punctuality-record.component';

describe('AttendancePunctualityRecordComponent', () => {
  let component: AttendancePunctualityRecordComponent;
  let fixture: ComponentFixture<AttendancePunctualityRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendancePunctualityRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancePunctualityRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
