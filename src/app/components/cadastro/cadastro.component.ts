import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Validador personalizado para comparar senhas
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmarSenha = control.get('confirmarSenha');

  if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
    confirmarSenha.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  signupForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required]
  }, { validators: passwordMatchValidator }); // Validação aplicada ao grupo

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Dados do cadastro:', this.signupForm.value);
      
      // Aqui você chamaria seu serviço de backend
      
      // Simulação de sucesso: Redirecionar para login após cadastro
      alert('Cadastro realizado com sucesso!');
      this.router.navigate(['/login']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}