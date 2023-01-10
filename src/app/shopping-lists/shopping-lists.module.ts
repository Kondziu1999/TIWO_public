import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShoppingListsRoutingModule } from './shopping-lists-routing.module';
import { ShoppingListsDashboardComponent } from './shopping-lists-dashboard/shopping-lists-dashboard.component';
import { ShoppingListEditorComponent } from './shopping-list-editor/shopping-list-editor.component';
import { ShoppingListSuggestedComponent } from './shopping-list-suggested/shopping-list-suggested.component';
import { ShoppingListItemComponent } from './shopping-list-item/shopping-list-item.component';
import { ShoppingListItemCreatorComponent } from './shopping-list-item-creator/shopping-list-item-creator.component';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { AddListDialogComponent } from './add-list-dialog/add-list-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    ShoppingListsDashboardComponent,
    ShoppingListEditorComponent,
    ShoppingListSuggestedComponent,
    ShoppingListItemComponent,
    ShoppingListItemCreatorComponent,
    AddListDialogComponent,
  ],
  imports: [
    CommonModule,
    ShoppingListsRoutingModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatCheckboxModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class ShoppingListsModule { }
