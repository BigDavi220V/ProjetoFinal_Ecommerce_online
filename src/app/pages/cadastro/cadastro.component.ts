import { Component, inject, signal, OnInit } from '@angular/core';
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

// Validador básico de CPF (formato 000.000.000-00 ou 11 dígitos)
const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value || '').toString();
  if (!value) return { required: true };
  const formatted = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  const digits = /^\d{11}$/;
  return formatted.test(value) || digits.test(value) ? null : { cpfInvalid: true };
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);

  isLoading = signal(false);

  signupForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''], // Campo opcional
    senha: ['', [Validators.required, Validators.minLength(8)]],
    confirmarSenha: ['', Validators.required],
    cpf: ['', [cpfValidator]],
    bairro: ['', [Validators.required]],
    rua: ['', [Validators.required]],
    numero: ['', [Validators.required, Validators.pattern('^\\d+$')]],
    cidade: ['', [Validators.required]],
    uf: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2}$'), Validators.maxLength(2)]],
    // Campo obrigatório para LGPD (Lei Geral de Proteção de Dados)
    lgpd: [false, Validators.requiredTrue]
  }, { validators: passwordMatchValidator }); // Validador aplicado ao grupo todo

  // Getter para facilitar acesso no HTML
  get f() { return this.signupForm.controls; }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { nome, email, senha, telefone, cpf, bairro, rua, numero, cidade, uf, lgpd } = this.signupForm.value;

    // Envia novos campos de CPF e endereço completo para o backend
    this.userService.cadastrar({ nome, email, senha, telefone, cpf, bairro, rua, numero, cidade, uf, lgpd }).subscribe({
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

  ngOnInit() {
    // Inicialização se necessário
  }
}
