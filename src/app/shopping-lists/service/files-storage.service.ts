import { Injectable } from '@angular/core';
import { deleteObject, getDownloadURL, Storage } from '@angular/fire/storage';
import { ref, uploadBytes, UploadMetadata } from '@firebase/storage';
import { uuidv4 } from '@firebase/util';
import { defer, forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilesStorageService {
  private userId!: string;

  constructor(private storage: Storage) {}

  setup(userId: string): void {
    this.userId = userId;
  }

  uploadImage(file: File) {
    const uuid = uuidv4();
    const storageRef = ref(this.storage, `images/${this.userId}/${uuid}`);

    const metadata: UploadMetadata  = {
      contentType: file.type,
    };

    return defer(() => uploadBytes(storageRef, file, metadata)).pipe(map(() => uuid));
  }

  deleteImage(id: string) {
    const storageRef = ref(this.storage, `images/${this.userId}/${id}`);
    return defer(() => deleteObject(storageRef));
  }

  deleteImages(ids: string[]) {
    return ids.length === 0 ? of(void 0) : forkJoin([
      ...ids.map(id => this.deleteImage(id))
    ]).pipe(map(() => {}));
  }

  getImageDownloadUrl(id: string): Observable<string> {
    const storageRef = ref(this.storage, `images/${this.userId}/${id}`);

    return defer(() => getDownloadURL(storageRef));
  }

}
