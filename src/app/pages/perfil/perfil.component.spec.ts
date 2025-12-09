import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { UserService } from '../../services/user.service';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

class MockUserService {
  getUser() { return of({ id: 1, name: 'Test User' }); }
  updateUser() { return of({}); }
}

class MockPurchaseHistoryService {
  getPurchaseHistory() { return of([]); }
}

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: PurchaseHistoryService, useClass: MockPurchaseHistoryService },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show admin button when user is admin', () => {
    localStorage.setItem('is_admin', 'true');
    component.checkAdminStatus(); // Update signal manually or trigger ngOnInit
    fixture.detectChanges();
    
    const adminBtn = fixture.debugElement.query(By.css('.btn-admin'));
    expect(adminBtn).toBeTruthy();
    expect(adminBtn.nativeElement.textContent).toContain('Acessar Painel ADM');
  });

  it('should hide admin button when user is not admin', () => {
    localStorage.removeItem('is_admin');
    component.checkAdminStatus();
    fixture.detectChanges();
    
    const adminBtn = fixture.debugElement.query(By.css('.btn-admin'));
    expect(adminBtn).toBeNull();
  });

  it('should navigate to admin dashboard when button is clicked', () => {
    localStorage.setItem('is_admin', 'true');
    component.checkAdminStatus();
    fixture.detectChanges();
    
    // Mock the router promise
    (router.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

    const adminBtn = fixture.debugElement.query(By.css('.btn-admin'));
    adminBtn.nativeElement.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });
});
