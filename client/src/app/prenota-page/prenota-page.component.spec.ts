import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrenotaPageComponent } from './prenota-page.component';

describe('PrenotaPageComponent', () => {
  let component: PrenotaPageComponent;
  let fixture: ComponentFixture<PrenotaPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrenotaPageComponent]
    });
    fixture = TestBed.createComponent(PrenotaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
