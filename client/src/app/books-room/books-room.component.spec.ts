import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksRoomComponent } from './books-room.component';

describe('BooksRoomComponent', () => {
  let component: BooksRoomComponent;
  let fixture: ComponentFixture<BooksRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BooksRoomComponent]
    });
    fixture = TestBed.createComponent(BooksRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
