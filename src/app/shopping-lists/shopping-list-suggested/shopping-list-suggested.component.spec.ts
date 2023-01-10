import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListSuggestedComponent } from './shopping-list-suggested.component';

describe('ShoppingListSuggestedComponent', () => {
  let component: ShoppingListSuggestedComponent;
  let fixture: ComponentFixture<ShoppingListSuggestedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShoppingListSuggestedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListSuggestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
