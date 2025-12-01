import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
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

  products = signal<any[]>([]);
  showForm = signal(false);
  selectedFile: File | null = null;
  galleryFiles: FileList | null = null;
  
  productForm = this.fb.group({
    nome: ['', Validators.required],
    descricao: [''],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    estoque: [0, [Validators.required, Validators.min(0)]],
    categoria_id: [1, Validators.required]
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.adminService.getAllProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Erro ao listar produtos', err)
    });
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

  onSubmit() {
    if (this.productForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.productForm.controls).forEach(key => {
      const value = this.productForm.get(key)?.value;
      formData.append(key, value !== null ? value : '');
    });

    if (this.selectedFile) {
      formData.append('imagem', this.selectedFile);
    }

    this.adminService.createProduct(formData).subscribe({
      next: (res) => {
        console.log('Produto criado', res);
        
        if (this.galleryFiles && this.galleryFiles.length > 0) {
           this.uploadGallery(res.id);
        } else {
           alert('Produto criado com sucesso!');
           this.resetForm();
           this.loadProducts();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao criar produto.');
      }
    });
  }

  uploadGallery(productId: number) {
    const formData = new FormData();
    if (this.galleryFiles) {
        for (let i = 0; i < this.galleryFiles.length; i++) {
          formData.append('imagens', this.galleryFiles[i]);
        }
    }

    this.adminService.uploadGallery(productId, formData).subscribe({
      next: () => {
        alert('Produto e galeria salvos com sucesso!');
        this.resetForm();
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        alert('Produto criado, mas erro ao enviar galeria.');
        this.resetForm();
        this.loadProducts();
      }
    });
  }

  resetForm() {
    this.productForm.reset({ categoria_id: 1, preco: 0, estoque: 0 });
    this.selectedFile = null;
    this.galleryFiles = null;
    this.showForm.set(false);
  }
}
