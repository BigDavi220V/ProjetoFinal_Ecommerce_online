import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  isLoading = signal(false);

  signupForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
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
    console.log('Dados enviados:', this.signupForm.value);

    // Simulação de envio ao Backend
    setTimeout(() => {
      this.isLoading.set(false);
      alert('Conta criada com sucesso!');
      this.router.navigate(['/login']);
    }, 2000);
  }
}