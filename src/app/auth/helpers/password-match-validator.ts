import { ValidatorFn, FormGroup, AbstractControl, FormControl } from "@angular/forms";

type CrossPasswordLike = AbstractControl<{
  password: FormControl<string>,
  confirmPassword: FormControl<string>,
}>

export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl) => {
  const password = control.get("password")?.value;
  const confirm = control.get("confirmPassword")?.value;

  if (!password || !confirm) {
      return null;
  }

  if (password === confirm) {
      return null;
  }

  control.get("confirmPassword")?.setErrors({mismatch: true});

  return {mismatch: true,};
}