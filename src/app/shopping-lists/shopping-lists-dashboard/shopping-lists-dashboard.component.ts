import { switchMap, tap } from 'rxjs/operators';
import { onlyTruthy } from 'src/app/shared/rxjs/truthy-filter';
import { AddListDialogComponent, NewListData } from './../add-list-dialog/add-list-dialog.component';
import { Component, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ShoppingList } from '../models/shopping-list-models';
import { ShoppingListDataService } from './../service/shopping-list-data.service';

@Component({
  selector: 'app-shopping-list-dashboard',
  templateUrl: './shopping-lists-dashboard.component.html',
  styleUrls: [
    './shopping-lists-dashboard.component.scss'
  ]
})
export class ShoppingListsDashboardComponent implements OnInit {

  lists$!: Observable<ShoppingList[]>;

  constructor(private dataService: ShoppingListDataService, private dialog: MatDialog) {
  }

  ngOnInit (): void {
    this.lists$ = this.dataService.shoppingLists$
    this.dataService.fetchLists().subscribe();
  }
  
  addList(): void {
    this.dialog.open<AddListDialogComponent, undefined, NewListData | undefined>(AddListDialogComponent)
      .afterClosed()
      .pipe(
        onlyTruthy(),
        switchMap(x => this.dataService.createList(x.name, x.date))
      ).subscribe();
  }
}