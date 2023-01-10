import { FilesStorageService } from './service/files-storage.service';
import { filter } from 'rxjs/operators';
import { tap, switchMap } from 'rxjs/operators';
import { AuthService } from './../auth/service/auth.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { ShoppingList } from './models/shopping-list-models';
import { ShoppingListDataService } from './service/shopping-list-data.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsResolver implements Resolve<ShoppingList[]> {

  constructor(private dataService: ShoppingListDataService, private filesStorage: FilesStorageService ,private auth: AuthService) {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShoppingList[]> {
    return this.auth.user$.pipe(
      filter(x => x !== null),
      tap(x => this.dataService.setup(x!.id)),
      tap(x => this.filesStorage.setup(x!.id)),
      switchMap(() => this.dataService.fetchLists())
    );
  }
}
