import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth/service/auth.service';

import { AppToolbarComponent } from './app-toolbar.component';

describe('AppToolbarComponent', () => {
  let component: AppToolbarComponent;
  let fixture: ComponentFixture<AppToolbarComponent>;
  const authServiceStub = jasmine.createSpyObj('AuthService', ['logOut']);
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [ 
        AppToolbarComponent,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        {provide: AuthService, useValue: authServiceStub},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppToolbarComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout when clicking logout', fakeAsync(async () => {
    const btn = await loader.getHarness(MatButtonHarness.with({selector: "#logout"}));

    btn.click();
    tick();

    expect(authServiceStub.logOut).toHaveBeenCalled();
  }));

});
