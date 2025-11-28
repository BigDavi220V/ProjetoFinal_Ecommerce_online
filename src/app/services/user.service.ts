import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  getUser() {
    return of({
      name: 'Usuário de Teste',
      email: 'teste@email.com'
    });
  }
}
