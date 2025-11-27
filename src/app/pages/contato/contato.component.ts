import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule], // Necessário para o [formGroup] funcionar
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContactComponent {
  // Injeção de dependência moderna (sem construtor)
  private fb = inject(FormBuilder);

  // Signal para controlar o estado do botão (Carregando...)
  isSubmitting = signal(false);

  // Definição do Formulário e suas Regras
  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  enviar() {
    if (this.contactForm.valid) {
      // 1. Ativa o estado de carregamento
      this.isSubmitting.set(true);

      // 2. Simula uma requisição ao servidor (delay de 2 segundos)
      setTimeout(() => {
        console.log('Formulário enviado:', this.contactForm.value);
        
        // Aqui você futuramente conectaria com seu Backend ou EmailJS

        // 3. Feedback visual
        alert('Mensagem enviada com sucesso! A equipe IZZI entrará em contato.');

        // 4. Limpa o formulário e reseta o estado
        this.contactForm.reset();
        this.isSubmitting.set(false);
      }, 2000);
    } else {
      // Opcional: Marca todos como tocados para mostrar erros vermelhos se o user tentar forçar
      this.contactForm.markAllAsTouched();
    }
  }
}