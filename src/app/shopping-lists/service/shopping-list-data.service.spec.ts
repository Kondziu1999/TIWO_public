import { TestBed } from '@angular/core/testing';
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { map, switchMap, take } from 'rxjs/operators';
import { ShoppingItemFormModel } from './../shopping-list-item-creator/shopping-list-item-creator.component';
import { FilesStorageService } from './files-storage.service';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { forkJoin, lastValueFrom, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ShoppingListDataService } from './shopping-list-data.service';

describe('ShoppingListDataService', () => {
  let service: ShoppingListDataService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp(environment.firebase)),
          // Firestore - With Dev Emulator
          provideFirestore(() => {
            const firestore = getFirestore()

            connectFirestoreEmulator(firestore, 'localhost', 8080);
            enableIndexedDbPersistence(firestore);
          

            return firestore;
          }),
          
          provideStorage(() => {
            const storage = getStorage();

            connectStorageEmulator(storage, 'localhost', 9199);
            return storage;
          }),
        ],
        providers: [
          FilesStorageService
        ]
    });
    service = TestBed.inject(ShoppingListDataService);
    service.setup("test-user");
  })

  afterEach(async () => {
    await lastValueFrom(service.fetchLists().pipe(
      switchMap(lists => lists.length === 0 ? of(void 0) : forkJoin([...lists.map(list => service.deleteList(list.id!))]))
    ));

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a list', async () => {
    const listName = "test-list";
    const realizationDate = new Date();

    const createdList = await lastValueFrom(service.createList(listName, realizationDate).pipe(
      switchMap(list => service.getShoppingListElement$(list.id!).pipe(take(1))),
    ))


    expect(createdList!.name).toBe(listName);
    expect(createdList!.realizationDate).toBe(realizationDate.getTime())
    expect(createdList!.id).toBeTruthy();
    expect(createdList!.realized).toBe(false);
    expect(createdList!.items).toEqual([]);
  });

  it('should fetch all lists', async () => {
    const listNames = ["list1", "list2"];

    const realizationDate = new Date();

    const createdLists = await lastValueFrom(
      forkJoin([
        ...listNames.map(name => service.createList(name, realizationDate))
      ]).pipe(
        switchMap(() => service.fetchLists()),
        switchMap(() => service.shoppingLists$.pipe(take(1)))
      )
    );

    expect(createdLists.length).toBe(listNames.length);
  });

  it('should mark list as realized', async() => {
    const listName = "test-list";
    const realizationDate = new Date();

    const realizedList = await lastValueFrom(service.createList(listName, realizationDate).pipe(
      switchMap(list => service.getShoppingListElement$(list.id!).pipe(take(1))),
      switchMap(list => service.markAsRealized(list!.id!).pipe(map(() => list!.id!))),
      switchMap(id => service.getShoppingListElement$(id).pipe(take(1))),
    ));

    expect(realizedList!.realized).toBe(true)
  });


  it('should delete list', async() => {
    const listName = "test-list";
    const realizationDate = new Date();

    const deletedList = await lastValueFrom(service.createList(listName, realizationDate).pipe(
      switchMap(list => service.getShoppingListElement$(list.id!).pipe(take(1))),
      switchMap(list => service.deleteList(list!.id!).pipe(map(() => list!.id!))),
      switchMap(id => service.getShoppingListElement$(id).pipe(take(1)))
    ));

    expect(deletedList).toBeFalsy();
  });

  it('should add list item', async() => {
    const listName = "test-list";
    const realizationDate = new Date();

    const listItem: ShoppingItemFormModel = {
      image: null,
      name: 'name1',
      quantity: 1,
      basicWeight: 'kg'
    };

    const updatedList = await lastValueFrom(service.createList(listName, realizationDate).pipe(
      switchMap(list => service.getShoppingListElement$(list.id!).pipe(take(1))),
      switchMap(list => service.addListElement(list!.id!, listItem).pipe(map(() => list!.id!))),
      switchMap(id => service.getShoppingListElement$(id).pipe(take(1)))
    ));

    expect(updatedList!.items[0]).toBeTruthy();
  });


  it('should delete list item', async() => {
    const listName = "test-list";
    const realizationDate = new Date();

    const listItem: ShoppingItemFormModel = {
      image: null,
      name: 'name1',
      quantity: 1,
      basicWeight: 'kg'
    };
    
    const updatedList = await lastValueFrom(service.createList(listName, realizationDate).pipe(
      switchMap(list => service.getShoppingListElement$(list.id!).pipe(take(1))),
      switchMap(list => service.addListElement(list!.id!, listItem).pipe(map(e => [list!.id!, e.id]))),
      switchMap(([listId, elementId]) => service.deleteShopItem(listId, elementId).pipe(map(() => listId))),
      switchMap(id => service.getShoppingListElement$(id).pipe(take(1)))
    ));

    expect(updatedList!.items.length).toBe(0);
  });

  
});
