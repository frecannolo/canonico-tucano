import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointInCalendarComponent } from './point-in-calendar.component';

describe('PointInCalendarComponent', () => {
  let component: PointInCalendarComponent;
  let fixture: ComponentFixture<PointInCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointInCalendarComponent]
    });
    fixture = TestBed.createComponent(PointInCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
