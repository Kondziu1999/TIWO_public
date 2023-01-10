import { HarnessLoader } from '@angular/cdk/testing';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { switchMap } from 'rxjs/operators';
import { defaultBasisWeights } from './../models/shopping-list-models';

import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatOptionHarness } from '@angular/material/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { from } from 'rxjs';
import { ShoppingItemFormModel, ShoppingListItemCreatorComponent } from './shopping-list-item-creator.component';

describe('ShoppingListItemCreatorComponent', () => {
  interface ShoppingListItemCreatorHarnesses {
    name: MatInputHarness,
    quantity: MatInputHarness,
    weight: MatSelectHarness,
    addItem: MatButtonHarness,
    addItemCancel: MatButtonHarness,
  }

  async function getControls(loader: HarnessLoader): Promise<ShoppingListItemCreatorHarnesses> {
    const name = await loader.getHarness(MatInputHarness.with({selector: "#itemName"}));
    const quantity = await loader.getHarness(MatInputHarness.with({selector: "#itemQuantity"}));
    const weight = await loader.getHarness(MatSelectHarness.with({selector: "#itemWeight"}));
    const addItem = await loader.getHarness(MatButtonHarness.with({selector: "#confirmItemAdd"}));
    const addItemCancel = await loader.getHarness(MatButtonHarness.with({selector: "#itemAddCancel"}));

    return {
      name,
      quantity,
      weight,
      addItem,
      addItemCancel
    }
  }

  let component: ShoppingListItemCreatorComponent;
  let fixture: ComponentFixture<ShoppingListItemCreatorComponent>;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShoppingListItemCreatorComponent ],
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
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ShoppingListItemCreatorComponent);
    component = fixture.componentInstance;

    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be valid and submit button should be enabled', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("item1");
    await controls.quantity.setValue("5");
    await controls.weight.open();

    const options = await controls.weight.getOptions({text: "kg"});
    await options[0].click();

    expect(component.form.valid).toBeTruthy();
    expect(await controls.addItem.isDisabled()).toBeFalsy();
  });

  it('submit button should be disabled when form is invalid', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("");
    await controls.quantity.setValue("0");
    await controls.weight.open();

    const options = await controls.weight.getOptions({text: "kg"});
    await options[0].click();

    expect(component.form.invalid).toBeTruthy();
    expect(await controls.addItem.isDisabled()).toBeTruthy();

    await controls.name.setValue("a".repeat(41));
    expect(component.form.invalid).toBeTruthy();
    expect(await controls.addItem.isDisabled()).toBeTruthy();
  });

  it('form should be invalid when quantity is negative', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("item1");
    await controls.quantity.setValue("-5");
    await controls.weight.open();
    const options = await controls.weight.getOptions({text: "kg"});
    await options[0].click();

    expect(component.form.invalid).toBeTruthy();
  });

  it('weight should contain only predefined options', async () => {
    const controls = await getControls(loader);

    await controls.weight.open();
    const options = await controls.weight.getOptions();
    const optionsTexts = await Promise.all([...options.map(x => x.getText())]);

    const found = defaultBasisWeights.filter(x => optionsTexts.find(y => y !== x) === undefined);

    expect(found.length).toBe(0);
  });

  it('cancel should emit cancel event', fakeAsync(() => {
    let emitCounter = 0;
    component.canceled.subscribe(() => {
      emitCounter += 1;
    })

    from(getControls(loader)).pipe(
      switchMap(controls => from(controls.addItemCancel.click()))
    ).subscribe();

    tick();
    expect(emitCounter).toBe(1);
  }));

  it('submit should emit submit event with proper model when form is valid', fakeAsync(() => {
    let model!: ShoppingItemFormModel;
    component.selected.subscribe(x => model = x);

    const expectedModel: ShoppingItemFormModel = {
      name: 'item1',
      image: null,
      basicWeight: 'kg',
      quantity: 5
    };

    let controls!: ShoppingListItemCreatorHarnesses;
    from(getControls(loader)).subscribe(x => controls = x);
    tick();

    from(controls.name.setValue("item1")).subscribe();
    tick();

    from( controls.quantity.setValue("5")).subscribe();
    tick();

    from(controls.weight.open()).subscribe();
    let options!: MatOptionHarness[];
    tick();

    from(controls.weight.getOptions({text: "kg"})).subscribe(x => options = x);
    tick();

    from(options[0].click()).subscribe();
    tick();
    from(controls.addItem.click()).subscribe();

    tick();
    expect(model).toEqual(expectedModel)
  }));

  it('preselected name should be propagated to form name when specified', async () => {
    component.preselectedName = "preselected";
    component.ngOnChanges();
    const controls = await getControls(loader);
    const actualValue = await controls.name.getValue();
  
    expect(actualValue).toBe("preselected");
  })
});
