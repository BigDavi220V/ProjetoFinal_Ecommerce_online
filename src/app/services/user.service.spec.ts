import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(UserService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false if not authenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true if user_id is in localStorage', () => {
    localStorage.setItem('user_id', '123');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return true if usuarioLogado is in localStorage (legacy)', () => {
    localStorage.setItem('usuarioLogado', 'true');
    expect(service.isAuthenticated()).toBeTrue();
  });
});
