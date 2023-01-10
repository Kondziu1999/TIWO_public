import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AddListDialogComponent, dateValidator } from './add-list-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonModule } from '@angular/material/button';

describe('AddListDialogComponent', () => {
  let component: AddListDialogComponent;
  let fixture: ComponentFixture<AddListDialogComponent>;
  let loader: HarnessLoader;

  interface ListDialogHarnesses {
    dp: MatDatepickerInputHarness,
    name: MatInputHarness,
    button: MatButtonHarness,
  }

  async function getControls(loader: HarnessLoader): Promise<ListDialogHarnesses> {
    const dp = await loader.getHarness(MatDatepickerInputHarness.with({selector: "#datePicker"}))
    const name = await loader.getHarness(MatInputHarness.with({selector: "#listName"}));
    const button = await loader.getHarness(MatButtonHarness.with({selector: "#addList"}));

    return {
      dp,
      name,
      button,
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddListDialogComponent ],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatNativeDateModule,
        MatButtonModule,
        ReactiveFormsModule,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddListDialogComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should submit be disabled when date is not specified', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("list1");
    const isDisabledButton = await controls.button.isDisabled()
    expect(isDisabledButton).toBeTrue();
  });

  it('should submit be disabled when date is invalid', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("list1");
    await controls.dp.setValue("asdasda");
    const isDisabledButton = await controls.button.isDisabled()
    expect(isDisabledButton).toBeTrue();
  });

  it('should submit be disabled when name is not specified', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("");
    await controls.dp.setValue("1/1/2030");

    const isDisabledButton = await controls.button.isDisabled()
    expect(isDisabledButton).toBeTrue();
  });

 it('should submit be disabled when name is longer than 40 chars', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("a".repeat(41));
    await controls.dp.setValue("1/1/2030");

    const isDisabledButton = await controls.button.isDisabled()
    expect(isDisabledButton).toBeTrue();
  });

  it('should submit be enabled when date and name are valid', async () => {
    const controls = await getControls(loader);

    await controls.name.setValue("list1");
    await controls.dp.setValue("1/1/2030");

    const isDisabledButton = await controls.button.isDisabled()
    expect(isDisabledButton).toBeFalse();
  });


  it('should return invalid date for date in the past', () => {
    const date = new Date(Date.now() - 1000);

    const control = new FormControl<Date>(date);

    expect(dateValidator()(control)).toEqual({invalidDate: true})
  });

  it('should return valid date for date in the future', () => {
    const date = new Date(Date.now() + 10000);

    const control = new FormControl<Date>(date);

    expect(dateValidator()(control)).toEqual(null);
  });

});
