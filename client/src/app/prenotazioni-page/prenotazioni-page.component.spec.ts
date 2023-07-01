import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrenotazioniPageComponent } from './prenotazioni-page.component';

describe('PrenotazioniPageComponent', () => {
  let component: PrenotazioniPageComponent;
  let fixture: ComponentFixture<PrenotazioniPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrenotazioniPageComponent]
    });
    fixture = TestBed.createComponent(PrenotazioniPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
