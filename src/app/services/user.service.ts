import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:2009'; // URL da API Node.js

  constructor() { }

  // Cadastro de Usuário
  cadastrar(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cadastrar`, dados); // Retorna JSON
  }

  // Login de Usuário
  login(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciais); // O padrão é JSON, que é o que a API retorna agora
  }

  // Busca dados do usuário logado, por ID ou email
  getUser() {
    const id = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
    if (id) {
      return this.http.get(`${this.apiUrl}/clientes/${id}`);
    }
    if (email) {
      return this.http.get(`${this.apiUrl}/clientes`, { params: { email } });
    }
    return this.http.get(`${this.apiUrl}/clientes/1`);
  }

  updateUser(id: number | string, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, dados);
  }

  // Finalizar Pedido (Checkout)
  checkout(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, payload);
  }
}
