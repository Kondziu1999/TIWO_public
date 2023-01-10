import { ShoppingListsResolver } from './shopping-lists.resolver';
import { ShoppingListEditorComponent } from './shopping-list-editor/shopping-list-editor.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShoppingListsDashboardComponent } from './shopping-lists-dashboard/shopping-lists-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ShoppingListsDashboardComponent,
    resolve: {
      lists: ShoppingListsResolver
    }
  },
  {
    path: 'editor/:id',
    component: ShoppingListEditorComponent,
    resolve: {
      lists: ShoppingListsResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShoppingListsRoutingModule { }
