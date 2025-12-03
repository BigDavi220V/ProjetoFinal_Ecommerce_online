import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carrinhoService = inject(CarrinhoService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Dados do Carrinho (Reais ou Simulados)
  cartItems = signal<any[]>([]);
  total = signal<number>(0);
  frete = 15.90;

  // Controle de Abas de Pagamento
  paymentMethod = signal<'boleto' | 'credit' | 'debit'>('boleto');

  // Estado da Simulação
  simulationStep = signal<'form' | 'processing' | 'finished'>('form');
  simulationStatus = signal<string>('');
  simulationDetails = signal<any>(null);

  // Formulário de Cliente e Endereço
  checkoutForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    cpf: ['', Validators.required],
    cep: ['', Validators.required],
    endereco: ['', Validators.required],
    numero: ['', Validators.required],
    complemento: [''],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    uf: ['', Validators.required]
  });

  // Formulários de Pagamento
  creditCardForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardName: ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    installments: ['1', Validators.required]
  });

  debitCardForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardName: ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });

  ngOnInit() {
    this.loadCart();
    this.loadUser();
  }

  loadCart() {
    const items = this.carrinhoService.getItems()();
    if (items.length > 0) {
      this.cartItems.set(items);
      this.total.set(this.carrinhoService.valorTotal());
    } else {
      // Simulação: Popula com dados fictícios se o carrinho estiver vazio
      const mockItems = [
        {
          product: {
            id: 101,
            name: 'Legging Alta Performance',
            nome: 'Legging Alta Performance',
            price: 129.90,
            image: 'assets/Modelo_01.png'
          },
          quantity: 1,
          size: 'M'
        },
        {
          product: {
            id: 102,
            name: 'Top Esportivo Suporte',
            nome: 'Top Esportivo Suporte',
            price: 89.90,
            image: 'assets/Modelo_02.png'
          },
          quantity: 2,
          size: 'P'
        }
      ];
      this.cartItems.set(mockItems);
      this.total.set(129.90 * 1 + 89.90 * 2);
    }
  }

  loadUser() {
    this.userService.getUser().subscribe({
      next: (user: any) => {
        if (user) {
          this.checkoutForm.patchValue({
            nome: user.nome_completo || user.nome,
            email: user.email,
            telefone: user.telefone,
            cpf: user.cpf_cnpj || user.cpf,
            // Tenta extrair endereço se possível, senão deixa vazio
            endereco: user.endereco ? user.endereco.split(',')[0] : ''
          });
        }
      },
      error: () => {
        console.log('Usuário não logado ou erro ao buscar dados');
      }
    });
  }

  setPaymentMethod(method: 'boleto' | 'credit' | 'debit') {
    this.paymentMethod.set(method);
  }

  getInstallments() {
    const totalWithFreight = this.total() + this.frete;
    const options = [1, 2, 3, 6, 12];
    return options.map(opt => ({
      value: opt,
      label: `${opt}x de ${(totalWithFreight / opt).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    }));
  }

  finalizeOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      alert('Por favor, preencha todos os dados de entrega.');
      return;
    }

    const method = this.paymentMethod();
    if (method === 'credit' && this.creditCardForm.invalid) {
      this.creditCardForm.markAllAsTouched();
      alert('Verifique os dados do cartão de crédito.');
      return;
    }
    if (method === 'debit' && this.debitCardForm.invalid) {
      this.debitCardForm.markAllAsTouched();
      alert('Verifique os dados do cartão de débito.');
      return;
    }

    // Inicia Simulação
    this.simulationStep.set('processing');

    setTimeout(() => {
      this.processSimulation(method);
    }, 3000); // 3 segundos de "processando"
  }

  processSimulation(method: string) {
    const totalFinal = this.total() + this.frete;
    const date = new Date();
    let status = '';

    // Configurar detalhes da simulação local
    if (method === 'boleto') {
      status = 'Aguardando pagamento';
      this.simulationStatus.set(status);
      this.simulationDetails.set({
        type: 'boleto',
        orderNumber: Math.floor(Math.random() * 1000000), // Temporário até ter ID do banco
        total: totalFinal,
        timeline: [
          { day: 'Hoje', status: 'Boleto gerado', active: true },
          { day: '1-3 dias', status: 'Compensação', active: false },
          { day: 'Dia 3+', status: 'Confirmado', active: false }
        ]
      });
    } else if (method === 'credit') {
      status = 'Pagamento aprovado';
      const installments = this.creditCardForm.get('installments')?.value;
      const cardNum = this.creditCardForm.get('cardNumber')?.value;
      this.simulationStatus.set(status);
      this.simulationDetails.set({
        type: 'credit',
        total: totalFinal,
        installments: installments,
        installmentValue: totalFinal / installments,
        cardBrand: 'MasterCard', 
        lastDigits: cardNum.slice(-4),
        approvalDate: date.toLocaleString('pt-BR')
      });
    } else if (method === 'debit') {
      status = 'Pagamento confirmado';
      const cardNum = this.debitCardForm.get('cardNumber')?.value;
      this.simulationStatus.set(status);
      this.simulationDetails.set({
        type: 'debit',
        total: totalFinal,
        date: date.toLocaleString('pt-BR'),
        bank: 'Nubank',
        lastDigits: cardNum.slice(-4)
      });
    }

    // Persistir no Backend
    const usuarioId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    
    // Se não tiver usuário logado (simulação pura), apenas finaliza a UI
    if (!usuarioId) {
      this.simulationStep.set('finished');
      this.carrinhoService.limparCarrinho();
      return;
    }

    const payload = {
      usuario_id: usuarioId,
      items: this.cartItems(),
      metodo_pagamento: method,
      status_pedido: status,
      endereco_id: null // Pode ser implementado depois
    };

    this.userService.checkout(payload).subscribe({
      next: (res: any) => {
        console.log('Pedido salvo com sucesso:', res);
        if (method === 'boleto' && res.pedido_id) {
           // Atualiza número do pedido com o real do banco
           const details = this.simulationDetails();
           this.simulationDetails.set({ ...details, orderNumber: res.pedido_id });
        }
        this.simulationStep.set('finished');
        this.carrinhoService.limparCarrinho();
      },
      error: (err) => {
        console.error('Erro ao salvar pedido:', err);
        alert('Houve um erro ao processar seu pedido no sistema, mas a simulação será concluída.');
        this.simulationStep.set('finished');
        this.carrinhoService.limparCarrinho();
      }
    });
  }
}
