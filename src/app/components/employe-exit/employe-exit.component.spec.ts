import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeExitComponent } from './employe-exit.component';

describe('EmployeExitComponent', () => {
  let component: EmployeExitComponent;
  let fixture: ComponentFixture<EmployeExitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeExitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
