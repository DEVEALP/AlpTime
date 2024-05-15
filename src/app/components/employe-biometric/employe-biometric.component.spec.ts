import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeBiometricComponent } from './employe-biometric.component';

describe('EmployeBiometricComponent', () => {
  let component: EmployeBiometricComponent;
  let fixture: ComponentFixture<EmployeBiometricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeBiometricComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeBiometricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
