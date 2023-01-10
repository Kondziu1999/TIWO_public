import { CommonModule } from "@angular/common";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { of } from 'rxjs';
import { AuthService } from "../service/auth.service";
import { LoggedInGuard } from "./logged-in.guard";

describe('Logged in guard should', () => {
    let loggedInGuard: LoggedInGuard;
    let router = {
        navigate: jasmine.createSpy('navigate').and.returnValue(of({} as UrlTree))
    };
    let authServiceStub: Partial<AuthService>;

    beforeEach(waitForAsync(() => {
        authServiceStub = {
          isLoggedIn$: of(true)
        }

        TestBed.configureTestingModule({
            imports: [FormsModule, CommonModule],
            providers: [
              LoggedInGuard,
              {provide: Router, useValue: router},
              {provide: AuthService, useValue: authServiceStub},
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        loggedInGuard = TestBed.inject(LoggedInGuard);
    });

    it('should pass when user is logged in', (done: any) => {
      const obs = loggedInGuard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      obs.subscribe((res) => {
        expect(res).toBe(true)
        done();
      });
    });


    it('should redirect to auth when user is not logged in', (done: any) => {
      authServiceStub.isLoggedIn$ = of(false);

      const obs = loggedInGuard.canActivate({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

      obs.subscribe((res) => {
        expect(router.navigate).toHaveBeenCalledWith(['auth']);
        done();
      })
    });
});