import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, unauthGuard } from './auth.guard';
import { UserService } from '../services/user.service';

describe('Auth Guards', () => {
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let router: Router;

  const executeAuthGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const executeUnauthGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => unauthGuard(...guardParameters));

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['isAuthenticated']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: spy }
      ]
    });

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('should allow access when user is authenticated', () => {
      userServiceSpy.isAuthenticated.and.returnValue(true);
      
      const result = executeAuthGuard(
        {} as ActivatedRouteSnapshot, 
        { url: '/protected' } as RouterStateSnapshot
      );
      
      expect(result).toBeTrue();
    });

    it('should redirect to login when user is NOT authenticated', () => {
      userServiceSpy.isAuthenticated.and.returnValue(false);
      
      const result = executeAuthGuard(
        {} as ActivatedRouteSnapshot, 
        { url: '/protected' } as RouterStateSnapshot
      );
      
      expect(result instanceof UrlTree).toBeTrue();
      const urlTree = result as UrlTree;
      expect(urlTree.toString()).toContain('/login');
      expect(urlTree.queryParams['returnUrl']).toBe('/protected');
    });
  });

  describe('unauthGuard', () => {
    it('should allow access when user is NOT authenticated', () => {
      userServiceSpy.isAuthenticated.and.returnValue(false);
      
      const result = executeUnauthGuard(
        {} as ActivatedRouteSnapshot, 
        { url: '/login' } as RouterStateSnapshot
      );
      
      expect(result).toBeTrue();
    });

    it('should redirect to home when user is authenticated', () => {
      userServiceSpy.isAuthenticated.and.returnValue(true);
      
      const result = executeUnauthGuard(
        {} as ActivatedRouteSnapshot, 
        { url: '/login' } as RouterStateSnapshot
      );
      
      expect(result instanceof UrlTree).toBeTrue();
      expect((result as UrlTree).toString()).toBe('/home');
    });
  });
});
