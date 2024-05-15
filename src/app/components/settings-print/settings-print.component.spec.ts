import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPrintComponent } from './settings-print.component';

describe('SettingsPrintComponent', () => {
  let component: SettingsPrintComponent;
  let fixture: ComponentFixture<SettingsPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsPrintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
