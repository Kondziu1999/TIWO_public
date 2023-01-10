import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { defaultBasisWeights, ShoppingItem } from './../models/shopping-list-models';

export function basicWeightValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value;
      const isFound = defaultBasisWeights.find(x => x === value) !== undefined;

      return isFound ? null : {invalidBasicWeight: true};
    }
}

export interface ShoppingItemFormModel {
  name: string,
  quantity: number,
  basicWeight: string,
  image: File | undefined | null;
}

@Component({
  selector: 'app-shopping-list-item-creator',
  templateUrl: './shopping-list-item-creator.component.html',
  styleUrls: ['./shopping-list-item-creator.component.scss']
})
export class ShoppingListItemCreatorComponent implements OnChanges {

  readonly basicWeights = defaultBasisWeights;
  constructor(private fb: FormBuilder) { }

  @Input() preselectedName: string | null = null;

  @Output() canceled = new EventEmitter<void>();
  @Output() selected = new EventEmitter<ShoppingItemFormModel>();

  form = this.fb.nonNullable.group({
    image: new FormControl<File | undefined>(undefined),
    name: ["", [Validators.required, Validators.maxLength(40)]],
    quantity: [1, [Validators.required, Validators.min(Number.EPSILON)]],
    basicWeight: ["kg", [Validators.required, basicWeightValidator()]]
  })

  get nameControl() {
    return this.form.controls.name;
  }

  get imageControl() {
    return this.form.controls.image;
  }

  get quantityControl() {
    return this.form.controls.quantity;
  }

  ngOnChanges(): void {
    if(this.preselectedName !== null) {
      this.form.controls.name.setValue(this.preselectedName);
    }
  }

  onSubmit(): void {
    this.selected.emit({...this.form.getRawValue()});
  }

  onFileSelected(event: any) {
    this.imageControl.setValue(event?.target?.files[0] ?? undefined);
  }

}

