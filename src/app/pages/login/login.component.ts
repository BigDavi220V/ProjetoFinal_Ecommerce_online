import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

    // Simulação de Backend
    setTimeout(() => {
      console.log('Login realizado:', this.loginForm.value);
      this.isLoading.set(false);
      
      // Redirecionamento após login (ajuste a rota conforme seu app)
       this.router.navigate(['/home']);
      alert('Login efetuado com sucesso!');
    }, 2000);
  }

  
}