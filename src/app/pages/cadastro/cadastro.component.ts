import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

// Validador personalizado para comparar senhas
const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmarSenha = control.get('confirmarSenha');

  if (!senha || !confirmarSenha) return null;

  return senha.value === confirmarSenha.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);

  isLoading = signal(false);

  signupForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''], // Campo opcional
    senha: ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required]
  }, { validators: passwordMatchValidator }); // Validador aplicado ao grupo todo

  // Getter para facilitar acesso no HTML
  get f() { return this.signupForm.controls; }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { nome, email, senha, telefone } = this.signupForm.value;

    this.userService.cadastrar({ nome, email, senha, telefone }).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        alert(response.message || 'Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Erro ao cadastrar:', error);
        const msg = error.error?.error || 'Erro ao realizar cadastro. Tente novamente.';
        alert(msg);
      }
    });
  }
}