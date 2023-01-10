import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { uuidv4 } from '@firebase/util';
import { switchMap } from 'rxjs/operators';
import { ShoppingListDataService } from './../service/shopping-list-data.service';

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { from, of } from 'rxjs';
import { ShoppingItem, ShoppingList } from '../models/shopping-list-models';
import { ShoppingItemFormModel } from '../shopping-list-item-creator/shopping-list-item-creator.component';
import { ShoppingListEditorComponent } from './shopping-list-editor.component';

@Component({selector: 'app-shopping-list-item-creator', template: ''})
class ShoppingListItemCreatorStub {
  @Input() preselectedName: string | null = null;

  @Output() canceled = new EventEmitter<void>();
  @Output() selected = new EventEmitter<ShoppingItemFormModel>();
}


@Component({selector: 'app-shopping-list-item', template: ''})
class ShoppingListItemStub {
  @Input() item!: ShoppingItem;
  @Input() realized: boolean = false;

  @Output() editItem = new EventEmitter<ShoppingItem>();
  @Output() deleteItem = new EventEmitter<ShoppingItem>();
}


describe('ShoppingListEditorComponent', () => {
  let component: ShoppingListEditorComponent;
  let fixture: ComponentFixture<ShoppingListEditorComponent>;
  let loader: HarnessLoader;
  let dataServiceStub: Partial<ShoppingListDataService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let routerSpy: Router;

  const listStub: ShoppingList = {
      createdAt: new Date().getTime(),
      realizationDate: new Date().getTime(),
      realized: false,
      id: "1",
      name: "list1",
      items: [
        {
          id: "1",
          imageId: "12",
          name: "item1",
          quantity: 12,
          basicWeight: "kg"
        },
        {
          id: "2",
          name: "item2",
          imageId: null,
          quantity: 12.5,
          basicWeight: "l"
        }
      ]
    };

  beforeEach(waitForAsync(() => {
    dataServiceStub = {
      getShoppingListElement$: (id) => of(listStub),
      addListElement: (id, item) => of({...item, id: uuidv4(), imageId: null}),
      markAsRealized: (id) => of(void 0),
      deleteShopItem: (item) => of(void 0),
      deleteList: (id) => of(void 0),
    }

    activatedRouteStub = {
      paramMap: of({
      get(name): string | null {
        return listStub.id!
      },
    } as ParamMap)};

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      declarations: [ ShoppingListEditorComponent, ShoppingListItemCreatorStub, ShoppingListItemStub ],
      imports: [
        CommonModule,
        RouterTestingModule.withRoutes([]),
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatDividerModule,
        MatButtonModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        MatOptionModule,
        MatSelectModule,
      ],
      providers: [
        {provide: ShoppingListDataService, useValue: dataServiceStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        { provide: Router, useValue: routerSpy },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListEditorComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('mark as realized should change realized field to true and hide add list item options', fakeAsync(() => {
    tick();

    from(loader.getHarness(MatButtonHarness.with({selector: "#markAsRealized"}))).pipe(
      switchMap(btn => from(btn.click()))
    ).subscribe();

    tick();

    expect(component.editedElement!.realized).toBeTruthy();

    from(loader.getAllHarnesses(MatButtonHarness.with({selector: "#addListItem"}))).subscribe(
     btns => expect(btns.length).toBe(0) 
    )

    from(loader.getAllHarnesses(MatButtonHarness.with({selector: "#markAsRealized"}))).subscribe(
     btns => expect(btns.length).toBe(0) 
    )

    tick();
  }));

  it('add list item button should show creator and hide itself', async () => {
    component.creatorModeOpened = false;

    const getAddListItemButtons = () => loader.getAllHarnesses(MatButtonHarness.with({selector: "#addListItem"}));

    const btnsBefore = await getAddListItemButtons();
    expect(btnsBefore.length).toBe(1);

    const btn = await loader.getHarness(MatButtonHarness.with({selector: "#addListItem"}));
    await btn.click();

    const btnsAfter = await getAddListItemButtons();
    const defaultWeightSelector = await loader.getAllHarnesses(MatSelectHarness.with({selector: "#defaultWeightsSelect"}));

    expect(btnsAfter.length).toBe(0);
    expect(defaultWeightSelector.length).toBe(1);
  });

  it('deleted item should be passed to data service and should be removed from internal component state', fakeAsync(() => {
    const itemToDelete = component.editedElement!.items[0];
    const deleteShopItemSpy = spyOn(dataServiceStub as ShoppingListDataService, "deleteShopItem").and.callThrough();

    const itemComponentDebug = findComponent(fixture, "#list-item" + itemToDelete.id);

    (itemComponentDebug.componentInstance as ShoppingListItemStub).deleteItem.emit(itemToDelete);

    tick();

    expect(deleteShopItemSpy).toHaveBeenCalled();
    const deletedItem = component.editedElement!.items.find(x => x.id === itemToDelete.id);
    expect(deletedItem).toBeFalsy();
  }));

  it('added item should be passed to data service and should be added to internal component state', fakeAsync(() => {
    component.creatorModeOpened = true;
    fixture.detectChanges();

    const itemToAdd: ShoppingItemFormModel = {
      image: null,
      name: "name12",
      quantity: 12,
      basicWeight: "kg"
    };

    const addShopItemSpy = spyOn(dataServiceStub as ShoppingListDataService, "addListElement").and.callThrough();
    const creatorDebug = findComponent(fixture, "app-shopping-list-item-creator");
    (creatorDebug.componentInstance as ShoppingListItemCreatorStub).selected.emit(itemToAdd);

    tick();
    expect(addShopItemSpy).toHaveBeenCalled();
    
    expect(component.editedElement!.items.find(x => x.name === itemToAdd.name)).toBeTruthy();
  }));

  it('delete list should navigate to dashboard', fakeAsync(() => {
    const deleteListSpy = spyOn(dataServiceStub as ShoppingListDataService, "deleteList").and.callThrough();
    
    from(loader.getHarness(MatButtonHarness.with({selector: "#deleteList"}))).pipe(
      switchMap(btn => from(btn.click()))
    ).subscribe();

    tick();
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['management']);
    expect(deleteListSpy).toHaveBeenCalled();
  }));

  it('cancel creating item should hide creator and shot addListItem button', fakeAsync(() => {
    component.creatorModeOpened = true;
    fixture.detectChanges();

    const creatorDebug = findComponent(fixture, "app-shopping-list-item-creator");
    (creatorDebug.componentInstance as ShoppingListItemCreatorStub).canceled.emit();

    tick();
    from(loader.getAllHarnesses(MatButtonHarness.with({selector: "#addListItem"}))).subscribe(
      btns => expect(btns.length).toBe(1)
    );

    tick();
    
    expect(findComponent(fixture, "app-shopping-list-item-creator")).toBeFalsy();
  }));

});

export function findComponent<T>(
  fixture: ComponentFixture<T>,
  selector: string,
): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}
