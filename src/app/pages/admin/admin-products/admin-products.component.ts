import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private productService = inject(ProductService);

  // Usa o signal centralizado do ProductService para garantir consistência
  products = this.productService.products;
  
  showForm = signal(false);
  selectedFile: File | null = null;
  galleryFiles: FileList | null = null;
  
  productForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', Validators.required],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    estoque: [0, [Validators.required, Validators.min(0)]],
    categoria_id: [1, Validators.required],
    sku: [''],
    tags: [''],
    especificacoes: ['']
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.loadProducts();
  }

  toggleForm() {
    this.showForm.update(v => !v);
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onGallerySelected(event: any) {
    if (event.target.files.length > 0) {
      this.galleryFiles = event.target.files;
    }
  }

  // Método para submeter o formulário de produto
  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    try {
      const formValue = this.productForm.value;
      let imagemUrl = '';

      // Se houver imagem selecionada, converte para Base64 para armazenamento local
      if (this.selectedFile) {
        imagemUrl = await this.toBase64(this.selectedFile);
      }

      const newProduct = {
        ...formValue,
        id: 'local-' + Date.now(), // ID único para produtos locais
        imagem_url: imagemUrl,
        isLocal: true,
        createdAt: new Date().toISOString()
      };

      // Salva no localStorage (lógica de escrita mantida aqui por enquanto)
      const currentLocalProducts = this.getLocalProducts();
      currentLocalProducts.push(newProduct);
      localStorage.setItem('local_products', JSON.stringify(currentLocalProducts));

      alert('Produto cadastrado localmente com sucesso!');
      this.resetForm();
      
      // Atualiza a lista global no serviço
      this.productService.loadProducts();

    } catch (error) {
      console.error('Erro ao salvar produto localmente:', error);
      alert('Erro ao processar o produto.');
    }
  }

  // Helper para ler produtos locais (apenas para o push do onSubmit)
  private getLocalProducts(): any[] {
    const stored = localStorage.getItem('local_products');
    return stored ? JSON.parse(stored) : [];
  }

  private toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Upload de múltiplas imagens para a galeria (mantido mas não usado no fluxo local simples por enquanto)
  uploadGallery(productId: number) {
     // ... implementação existente se necessária ...
  }

  resetForm() {
    this.productForm.reset({ categoria_id: 1, preco: 0, estoque: 0 });
    this.selectedFile = null;
    this.galleryFiles = null;
    this.showForm.set(false);
  }

  // Remove um produto do banco de dados ou local
  deleteProduct(id: any) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    if (typeof id === 'string' && id.startsWith('local-')) {
      // Remover do localStorage
      const localProducts = this.getLocalProducts();
      const updatedProducts = localProducts.filter(p => p.id !== id);
      localStorage.setItem('local_products', JSON.stringify(updatedProducts));
      
      alert('Produto local removido com sucesso!');
      this.productService.loadProducts(); // Atualiza serviço
    } else {
      // Remover do backend
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          alert('Produto removido com sucesso!');
          this.productService.loadProducts(); // Atualiza serviço
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao remover produto.');
        }
      });
    }
  }
}
