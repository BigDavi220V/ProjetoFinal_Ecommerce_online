import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Injeção de dependências moderna
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);

  // Estado reativo com Signals
  isLoading = signal(false);
  showPassword = signal(false); // Extra: Funcionalidade para mostrar/ocultar senha

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]], // Exemplo de minLength
    rememberMe: [false]
  });

  // Getter para facilitar o acesso no HTML
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.userService.login({ email, senha: password }).subscribe({
      next: (response: any) => { // Tipar como any pois retorna JSON agora
        this.isLoading.set(false);
        console.log('Login realizado:', response);
        
        // Persistência simples de sessão
        if (response.userId) {
          localStorage.setItem('user_id', response.userId);
          localStorage.setItem('user_email', email!);
        }

        alert('Login efetuado com sucesso!');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Erro no login:', error);
        const msg = error.error?.error || 'Falha no login. Verifique suas credenciais.';
        alert(msg);
      }
    });
  }
}