import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionAddComponent } from './permission-add.component';

describe('PermissionAddComponent', () => {
  let component: PermissionAddComponent;
  let fixture: ComponentFixture<PermissionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
