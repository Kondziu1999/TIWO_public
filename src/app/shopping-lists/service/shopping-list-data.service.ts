import { Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, deleteDoc, doc, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { updateDoc } from '@firebase/firestore';
import { uuidv4 } from '@firebase/util';
import { BehaviorSubject, defer, forkJoin, from, iif, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ShoppingItem, ShoppingList } from './../models/shopping-list-models';
import { ShoppingItemFormModel } from './../shopping-list-item-creator/shopping-list-item-creator.component';
import { FilesStorageService } from './files-storage.service';


type ShoppingListStored = ShoppingList & {
  userId: string;
}


@Injectable({
  providedIn: 'root'
})
export class ShoppingListDataService {
  private readonly collectionName = "shopping-lists";
  private shoppingListCollection!: CollectionReference<ShoppingListStored>;

  private shoppingListsSubject = new BehaviorSubject<ShoppingListStored[]>([]);

  get shoppingLists$(): Observable<ShoppingList[]> {
    return this.shoppingListsSubject.asObservable();
  }

  getShoppingListElement$(id: string): Observable<ShoppingList | undefined> {
    return this.shoppingLists$.pipe(map(x => x.find(y => y.id === id)));
  }

  private userId!: string;

  constructor(private firestore: Firestore, private filesStorage: FilesStorageService) { 
    this.shoppingListCollection = collection(this.firestore, this.collectionName) as CollectionReference<ShoppingListStored>;
  }
  
  // Must be called in resolver(kinda noob approach but fast)
  setup(userId: string): void {
    this.userId = userId;
  }

  fetchLists(): Observable<ShoppingList[]> {
    const q = query(this.shoppingListCollection, where('userId', '==', this.userId));

    return defer(() => getDocs(q))
      .pipe(
        map(x => x.docs.map(y => {
          const data = y.data();
          data.id = y.id;
          return data
        })),
        tap(x => this.shoppingListsSubject.next(x))
      )
  }
  
  markAsRealized(listId: string): Observable<void> {
    const docRef = doc(this.shoppingListCollection, listId);

    return defer(() => updateDoc(docRef, {realized: true})).pipe(
      tap(() => {
        const newValue: ShoppingListStored = {...this.shoppingListsSubject.value.find(x => x.id === listId)!, realized: true};

        this.replaceInSubjectAndEmit((x,y) => x.id === y.id, this.shoppingListsSubject, newValue);
      })
    );

  }

  createList(name: string, date: Date): Observable<ShoppingList> {
    const newList: ShoppingListStored = {
      createdAt: new Date().getTime(),
      realizationDate: date.getTime(),
      items: [],
      name: name,
      realized: false,
      userId: this.userId,
    }

    return defer(() => addDoc(this.shoppingListCollection, newList)).pipe(
      map(x => ({...newList, id: x.id})),
      tap(x => {
        const current = this.shoppingListsSubject.value;
        this.shoppingListsSubject.next([...current, x]);
      })
    );
  }

  deleteShopItem(listId: string, itemId: string): Observable<void> {
    const docRef = doc(this.shoppingListCollection, listId);
    const listToUpdate = {...this.shoppingListsSubject.value.find(x => x.id === listId)!};
    const itemToRemove = listToUpdate.items.find(x => x.id === itemId)!;
    const updatedItems = listToUpdate.items.filter(x => x.id !== itemId);
    listToUpdate.items = updatedItems;

    const observables = [defer(() => updateDoc(docRef, {items: updatedItems}))];
    if(itemToRemove.imageId) {
      observables.push(this.filesStorage.deleteImage(itemToRemove.imageId));
    }

    return forkJoin(observables).pipe(
      tap(() => {
        this.replaceInSubjectAndEmit((x,y) => x.id === y.id, this.shoppingListsSubject, listToUpdate)
      }),
      map(() => {})
    )
  }

  addListElement(listId: string, element: ShoppingItemFormModel): Observable<ShoppingItem> {
    return iif(
      () => element.image !== null, 
      defer(() => this.filesStorage.uploadImage(element.image!)), 
      defer(() => of(null))
    ).pipe(
      switchMap(maybeImageId => {
        const newItem: ShoppingItem = {
          id: uuidv4(),
          basicWeight: element.basicWeight,
          name: element.name,
          quantity: element.quantity,
          imageId: maybeImageId
        };
        
        const listToEdit = this.shoppingListsSubject.value.find(x => x.id === listId)!;
        
        const updatedItems = [...listToEdit.items, newItem];
        const docRef = doc(this.shoppingListCollection, listId);
        return from(updateDoc(docRef, {items: updatedItems})).pipe(
          map(() => newItem),
          tap(() => {
            const list = {...listToEdit}
            list.items = updatedItems;
            this.replaceInSubjectAndEmit((x, y) => x.id ===  y.id, this.shoppingListsSubject, list);
          })
        );
      }),
    )
  }

  deleteList(listId: string): Observable<void> {
    const listImagesIds: string[] = this.shoppingListsSubject.value
      .find(x => x.id === listId)!.items
      .map(x => x.imageId)
      .filter(x => x !== null)
      .map(x => x as string);

    return defer(() => deleteDoc(doc(this.shoppingListCollection, listId))).pipe(
      switchMap(() => this.filesStorage.deleteImages(listImagesIds)),
      tap(() => {
        const currentVal = this.shoppingListsSubject.value;

        this.shoppingListsSubject.next(currentVal.filter(x => x.id !== listId));
      })
    );
  }
  
  private replaceInSubjectAndEmit<T>(comparator: (b:T, a:T) => boolean, sub: BehaviorSubject<T[]>, value: T) {
    const updatedValues = sub.value.map(item => comparator(item, value) ? value: item);
    sub.next(updatedValues)
  }

}
