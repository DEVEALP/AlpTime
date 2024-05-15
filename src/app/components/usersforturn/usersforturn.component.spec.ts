import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersforturnComponent } from './usersforturn.component';

describe('UsersforturnComponent', () => {
  let component: UsersforturnComponent;
  let fixture: ComponentFixture<UsersforturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersforturnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersforturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
