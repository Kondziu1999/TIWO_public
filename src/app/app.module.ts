import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppToolbarComponent } from './app-toolbar/app-toolbar.component';

import { HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, connectAuthEmulator, getAuth } from '@angular/fire/auth';

import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  getFirestore, provideFirestore
} from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeFirestore } from '@firebase/firestore';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppToolbarComponent,
    provideFirebaseApp(() => {
        const app = initializeApp(environment.firebase)
        initializeFirestore(app, {experimentalForceLongPolling: true }) // Cypress workaround ...
        return app;
    }),
    // Firestore - With Dev Emulator
    provideFirestore(() => {
      const firestore = getFirestore()
      
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      enableIndexedDbPersistence(firestore);
      
      return firestore;
    }),
    
    // Auth - With Dev Emulator
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

      return auth;
    }),
    provideStorage(() => {
      const storage = getStorage();

      connectStorageEmulator(storage, 'localhost', 9199);
      return storage;
    }),

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
