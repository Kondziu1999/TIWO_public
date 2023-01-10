import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from './auth/guard/logged-in.guard';

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
      path: 'management',
      loadChildren: () => import('./shopping-lists/shopping-lists.module').then(m => m.ShoppingListsModule),
      canActivate: [LoggedInGuard]
    },
    {
      path: '**',
      redirectTo: '/management'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
