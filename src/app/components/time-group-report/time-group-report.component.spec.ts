import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeGroupReportComponent } from './time-group-report.component';

describe('TimeGroupReportComponent', () => {
  let component: TimeGroupReportComponent;
  let fixture: ComponentFixture<TimeGroupReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeGroupReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeGroupReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
