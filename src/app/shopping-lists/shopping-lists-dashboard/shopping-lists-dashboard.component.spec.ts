import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddListDialogComponent } from '../add-list-dialog/add-list-dialog.component';
import { ShoppingList } from '../models/shopping-list-models';
import { ShoppingListDataService } from '../service/shopping-list-data.service';
import { ShoppingListsDashboardComponent } from './shopping-lists-dashboard.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ShoppingListsDashboardComponent', () => {
  let component: ShoppingListsDashboardComponent;
  let fixture: ComponentFixture<ShoppingListsDashboardComponent>;

  let shoppingListDataServiceStub: Partial<ShoppingListDataService>;
  let loader: HarnessLoader;
  let rootLoader: HarnessLoader;
  let dialog: MatDialog;
  
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
    shoppingListDataServiceStub = {
      shoppingLists$: of([listStub, {...listStub, id: "2", realized: true}]),
      fetchLists: () => of([]),
      createList: (name, date) => of(listStub)
    }

    TestBed.configureTestingModule({
      declarations: [ ShoppingListsDashboardComponent, AddListDialogComponent ],
      imports: [
        MatIconModule,
        MatButtonModule,
        RouterTestingModule.withRoutes([]),
        MatDialogModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
      ],
      providers: [
        {provide: ShoppingListDataService, useValue: shoppingListDataServiceStub}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingListsDashboardComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    dialog = fixture.debugElement.injector.get(MatDialog); 
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('add list btn should open AddListDialogComponent', fakeAsync(() => {
    from(loader.getHarness(MatButtonHarness.with({selector: "#addListBtn"}))).pipe(
      switchMap(btn => from(btn.click()))
    ).subscribe();

    tick();
    let dialogHarness: MatDialogHarness;

    from(rootLoader.getHarness(MatDialogHarness)).pipe(
      tap(x => dialogHarness = x)
    ).subscribe(
      d => expect(d).toBeTruthy()
    );

    tick();
  }));

  it('should realized list be crossed out and not realized should not', async () => {
    const getCrossLineFromChildNodes = (elem: DebugElement) => elem.childNodes.find(x => x.nativeNode.localName === "hr");

    const listNotRealized = fixture.debugElement.query(By.css('#listItem-0'));
    const listRealized = fixture.debugElement.query(By.css('#listItem-1'));
    const listNotRealizedCrossedLine = getCrossLineFromChildNodes(listNotRealized);
    const listRealizedCrossedLine = getCrossLineFromChildNodes(listRealized);

    expect(listNotRealizedCrossedLine).toBeFalsy();
    expect(listRealizedCrossedLine).toBeTruthy();
  })

});
