import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetOraNotificaComponent } from './set-ora-notifica.component';

describe('SetOraNotificaComponent', () => {
  let component: SetOraNotificaComponent;
  let fixture: ComponentFixture<SetOraNotificaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetOraNotificaComponent]
    });
    fixture = TestBed.createComponent(SetOraNotificaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
