import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Injeção de dependências (Sintaxe Angular 19)
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Definição do Formulário
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Dados do formulário:', this.loginForm.value);
      
      // Lógica de autenticação aqui...
      
      // Exemplo de redirecionamento após sucesso
      // this.router.navigate(['/dashboard']);
    } else {
      // Marca os campos como "touched" para exibir erros visuais se necessário
      this.loginForm.markAllAsTouched();
    }
  }
}