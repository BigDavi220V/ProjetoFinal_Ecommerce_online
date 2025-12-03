import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  // Injeção de dependências moderna
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
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
          
          if (response.isAdmin) {
            localStorage.setItem('is_admin', 'true');
          } else {
            localStorage.removeItem('is_admin');
          }
        }

        alert('Login efetuado com sucesso!');
        
        if (response.isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Erro no login:', error);
        const msg = error.error?.error || 'Falha no login. Verifique suas credenciais.';
        alert(msg);
      }
    });
  }

  // Redireciona para o provedor Google (API externa)
  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/auth/google';
  }

  // Processa retorno do Google via query params e autentica no app
  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const googleId = params.get('google_id');
      const googleEmail = params.get('google_email');
      const googleName = params.get('name');
      if (googleId && googleEmail) {
        localStorage.setItem('google_id', googleId);
        localStorage.setItem('user_email', googleEmail);
        if (googleName) localStorage.setItem('user_name', googleName);
        alert('Login com Google realizado!');
        this.router.navigate(['/home']);
      }
    });
  }
}
