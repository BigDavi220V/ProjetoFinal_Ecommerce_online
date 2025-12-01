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

  // Método legado (mantido por compatibilidade se necessário, mas idealmente deve ser removido ou atualizado)
  getUser() {
    // Pode ser implementado para buscar dados do perfil do usuário logado
    return this.http.get(`${this.apiUrl}/clientes/1`); // Exemplo estático, idealmente passaria o ID do usuário logado
  }
}
