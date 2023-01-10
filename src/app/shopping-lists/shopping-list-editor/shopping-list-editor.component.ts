import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, defer } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { onlyTruthy } from 'src/app/shared/rxjs/truthy-filter';
import { ShoppingList } from '../models/shopping-list-models';
import { ShoppingItemFormModel } from '../shopping-list-item-creator/shopping-list-item-creator.component';
import { defaultSuggestedItems, ShoppingItem } from './../models/shopping-list-models';
import { ShoppingListDataService } from './../service/shopping-list-data.service';

@Component({
  selector: 'app-shopping-list-editor',
  templateUrl: './shopping-list-editor.component.html',
  styleUrls: ['./shopping-list-editor.component.scss']
})
export class ShoppingListEditorComponent implements OnInit {
  editedElement: ShoppingList | undefined;
  error$!: Observable<boolean>;

  creatorModeOpened: boolean = false;
  // creatorEditMode: boolean = false;

  preselectedName = new FormControl(defaultSuggestedItems[0]);
  defaultItems = defaultSuggestedItems;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: ShoppingListDataService,
    private router: Router,
  ) { }

  // TODO confirmation on leaving page
  ngOnInit(): void {
    const errorS = new BehaviorSubject<boolean>(false);
    this.error$ = errorS.asObservable();

    this.activatedRoute.paramMap.pipe(
      map(x => x.get('id')),
      tap(id => {
        if (id === null) {
          errorS.next(true);
        }
      }),
      onlyTruthy(),
      switchMap(id => this.dataService.getShoppingListElement$(id).pipe(take(1))),
    ).subscribe(maybeList => {
        if(maybeList === undefined) {
          errorS.next(true);
          return;
        }
        this.editedElement = {...maybeList};
    })
  }

  onItemAdd(item: ShoppingItemFormModel) {
    this.dataService.addListElement(this.editedElement!.id!, item).subscribe(newItem => {
      this.creatorModeOpened = false;
      this.editedElement!.items.push(newItem);
    });
  }
  
  markAsRealized() {
    this.dataService.markAsRealized(this.editedElement!.id!).subscribe(() => this.editedElement!.realized = true);
  }

  deleteItem(item: ShoppingItem): void {
    this.dataService.deleteShopItem(this.editedElement!.id!, item.id).subscribe(() => {
      this.editedElement = {...this.editedElement!, items: this.editedElement!.items.filter(x => x.id !== item.id)};
    });
  }

  deleteList(): void {
    this.dataService.deleteList(this.editedElement!.id!).subscribe(
      () => this.router.navigate(['management'])
    );
  }

  editItem(item: ShoppingItem): void {
  }

  cancelCreation(): void {
    this.creatorModeOpened = false;
  }
}
