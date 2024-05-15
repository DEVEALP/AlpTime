import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeFamilyComponent } from './employe-family.component';

describe('EmployeFamilyComponent', () => {
  let component: EmployeFamilyComponent;
  let fixture: ComponentFixture<EmployeFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeFamilyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
