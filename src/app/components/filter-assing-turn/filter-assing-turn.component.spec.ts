import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterAssingTurnComponent } from './filter-assing-turn.component';

describe('FilterAssingTurnComponent', () => {
  let component: FilterAssingTurnComponent;
  let fixture: ComponentFixture<FilterAssingTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterAssingTurnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterAssingTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
