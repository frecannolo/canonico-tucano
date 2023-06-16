import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFissoComponent } from './menu-fisso.component';

describe('MenuFissoComponent', () => {
  let component: MenuFissoComponent;
  let fixture: ComponentFixture<MenuFissoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MenuFissoComponent]
    });
    fixture = TestBed.createComponent(MenuFissoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
