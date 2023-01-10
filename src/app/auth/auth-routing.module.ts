import { RegisterFormComponent } from './register-form/register-form.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { AuthFormsWrapperComponent } from './auth-forms-wrapper/auth-forms-wrapper.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
    {
        path: '',
        component: AuthFormsWrapperComponent,
        children: [
            {
                path: 'login',
                component: LoginFormComponent
            },
            {
                path: 'register',
                component: RegisterFormComponent
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
