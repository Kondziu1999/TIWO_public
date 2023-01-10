import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingItem } from './../models/shopping-list-models';
import { FilesStorageService } from './../service/files-storage.service';

@Component({
  selector: 'app-shopping-list-item',
  templateUrl: './shopping-list-item.component.html',
  styleUrls: ['./shopping-list-item.component.scss']
})
export class ShoppingListItemComponent implements OnInit {

  @Input() item!: ShoppingItem;
  @Input() realized: boolean = false;


  @Output() editItem = new EventEmitter<ShoppingItem>();
  @Output() deleteItem = new EventEmitter<ShoppingItem>();

  imageUrl$: Observable<string> | undefined;

  constructor(private storage: FilesStorageService) { }

  ngOnInit(): void {
    if(this.item.imageId !== null) {
      this.imageUrl$ = this.storage.getImageDownloadUrl(this.item.imageId);
    }
  }

}
