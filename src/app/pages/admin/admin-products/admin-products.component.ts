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
  editingId: string | number | null = null;
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
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  editProduct(product: any) {
    this.editingId = product.id;
    this.productForm.patchValue({
      nome: product.nome || product.name,
      descricao: product.descricao || product.description,
      preco: product.preco || product.price,
      estoque: product.estoque || product.stock || 0,
      categoria_id: product.categoria_id || 1,
      sku: product.sku || '',
      tags: product.tags || '',
      especificacoes: typeof product.especificacoes === 'object' ? JSON.stringify(product.especificacoes) : (product.especificacoes || '')
    });
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // 1. Processar imagens (Principal e Galeria)
      const imagemUrl = await this.processMainImage();
      const galleryImages = await this.processGalleryImages();

      // 2. Preparar objeto do produto
      const productData = {
        ...formValue,
        imagem_url: imagemUrl,
        images: galleryImages,
        isLocal: true,
        updatedAt: new Date().toISOString()
      };

      // 3. Salvar (Criar ou Atualizar)
      const success = this.saveProductData(productData);

      if (success) {
        this.resetForm();
        this.productService.loadProducts();
      }

    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao processar o produto. Verifique se o arquivo não é muito grande.');
    }
  }

  private async processMainImage(): Promise<string> {
    if (this.selectedFile) {
      return await this.toBase64(this.selectedFile);
    } else if (this.editingId) {
      const existing = this.products().find(p => p.id === this.editingId);
      return existing?.imagem_url || existing?.image || '';
    }
    return '';
  }

  private async processGalleryImages(): Promise<string[]> {
    if (this.galleryFiles && this.galleryFiles.length > 0) {
      const promises = Array.from(this.galleryFiles).map(file => this.toBase64(file));
      return await Promise.all(promises);
    } else if (this.editingId) {
      const existing = this.products().find(p => p.id === this.editingId);
      return (existing as any).images || [];
    }
    return [];
  }

  private saveProductData(productData: any): boolean {
    try {
      const currentLocalProducts = this.getLocalProducts();

      if (this.editingId) {
        // --- EDIÇÃO ---
        if (typeof this.editingId === 'string' && this.editingId.startsWith('local-')) {
          const index = currentLocalProducts.findIndex(p => p.id === this.editingId);
          if (index !== -1) {
            currentLocalProducts[index] = { ...currentLocalProducts[index], ...productData };
            this.saveToLocalStorage(currentLocalProducts);
            alert('Produto atualizado com sucesso!');
            return true;
          }
        } else {
          // Edição de estático -> Novo local
          const newId = 'local-' + Date.now();
          currentLocalProducts.push({ ...productData, id: newId, originalId: this.editingId });
          this.saveToLocalStorage(currentLocalProducts);
          alert('Produto estático editado salvo como nova cópia local.');
          return true;
        }
      } else {
        // --- CRIAÇÃO ---
        const newProduct = {
          ...productData,
          id: 'local-' + Date.now(),
          createdAt: new Date().toISOString()
        };
        currentLocalProducts.push(newProduct);
        this.saveToLocalStorage(currentLocalProducts);
        alert('Produto cadastrado localmente com sucesso!');
        return true;
      }
    } catch (e: any) {
      console.error('Erro ao salvar no storage:', e);
      // Lança um erro mais amigável se for cota excedida
      if (e.message.includes('Armazenamento cheio')) {
         throw e;
      }
      throw new Error('Falha ao salvar dados no armazenamento local.');
    }
    return false;
  }

  private saveToLocalStorage(products: any[]) {
    try {
      localStorage.setItem('local_products', JSON.stringify(products));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        throw new Error('Armazenamento cheio. Tente imagens menores.');
      }
      throw e;
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
    this.editingId = null;
    this.showForm.set(false);
  }

  // Remove um produto do banco de dados ou local
  deleteProduct(id: any) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    if (typeof id === 'string' && id.startsWith('local-')) {
      // Remover do localStorage
      const localProducts = this.getLocalProducts();
      const updatedProducts = localProducts.filter(p => p.id !== id);
      this.saveToLocalStorage(updatedProducts);
      
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
