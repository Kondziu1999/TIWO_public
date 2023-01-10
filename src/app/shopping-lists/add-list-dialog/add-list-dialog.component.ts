import { Component } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function dateValidator(): ValidatorFn {
    return (control:AbstractControl<Date>) : ValidationErrors | null => {
      const date = control.value;
      if (!(date instanceof Date)) {
        return {invalidDate: true};
      }

      return date > new Date() ? null : {invalidDate: true};
    }
}

export interface NewListData {
  name: string,
  date: Date
}

@Component({
  selector: 'app-add-list-dialog',
  templateUrl: './add-list-dialog.component.html',
  styleUrls: ['./add-list-dialog.component.scss']
})
export class AddListDialogComponent {
  minDate = new Date();

  nameControl = new FormControl<string>('', [Validators.required, Validators.maxLength(40)]);
  dateControl = new FormControl<Date>(new Date(), [Validators.required, dateValidator()]);
  
}

