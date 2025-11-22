import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-redefinir-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './redefinir-password.component.html',
  styleUrl: './redefinir-password.component.css'
})
export class RedefinirPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isLoading = signal(false);
  emailSent = signal(false); // Controle para mostrar mensagem de sucesso

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get f() { return this.resetForm.controls; }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // Simulação de envio de e-mail
    setTimeout(() => {
      this.isLoading.set(false);
      this.emailSent.set(true); // Altera a interface para mostrar sucesso
      
      // Opcional: Redirecionar após alguns segundos
      // setTimeout(() => this.router.navigate(['/login']), 3000);
    }, 2000);
  }
}