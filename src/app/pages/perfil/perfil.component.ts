import { Component, OnInit, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { PurchaseHistoryService } from '../../services/purchase-history.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  user: any;
  purchaseHistory: any[] = [];
  filteredHistory: any[] = [];
  
  // Sorting state
  sortField: string = 'data_pedido';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Form and State
  profileForm: FormGroup;
  isEditing = signal(false);
  isLoading = signal(false);

  private fb = inject(FormBuilder);

  constructor(
    private userService: UserService, 
    private purchaseHistoryService: PurchaseHistoryService
  ) {
    this.profileForm = this.fb.group({
      nome_completo: ['', [Validators.required, Validators.minLength(3)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      telefone: [''],
      endereco: [''],
      cpf_cnpj: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadPurchaseHistory();
  }

  loadUserData() {
    this.userService.getUser().subscribe({
      next: (data: any) => {
        this.user = data;
        this.profileForm.patchValue({
          nome_completo: data.nome_completo || data.name, // Fallback for different naming
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          cpf_cnpj: data.cpf_cnpj
        });
      },
      error: (err: any) => console.error('Erro ao carregar perfil', err)
    });
  }

  loadPurchaseHistory() {
    this.purchaseHistoryService.getPurchaseHistory().subscribe({
      next: (data: any) => {
        // Ensure it's an array
        this.purchaseHistory = Array.isArray(data) ? data : [];
        this.applySort();
      },
      error: (err: any) => console.error('Erro ao carregar histórico', err)
    });
  }

  sortHistory(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  applySort() {
    this.filteredHistory = [...this.purchaseHistory].sort((a, b) => {
      const valA = a[this.sortField];
      const valB = b[this.sortField];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      // Reset form if cancelled
      this.loadUserData();
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    const updatedData = this.profileForm.getRawValue(); // Includes disabled fields if needed, though we usually don't update email

    this.userService.updateUser(this.user.id, updatedData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        this.loadUserData(); // Refresh data
        alert('Perfil atualizado com sucesso!');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error(err);
        alert('Erro ao atualizar perfil.');
      }
    });
  }
}
