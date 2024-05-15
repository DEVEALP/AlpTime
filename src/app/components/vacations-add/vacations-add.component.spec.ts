import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacationsAddComponent } from './vacations-add.component';

describe('VacationsAddComponent', () => {
  let component: VacationsAddComponent;
  let fixture: ComponentFixture<VacationsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacationsAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacationsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
