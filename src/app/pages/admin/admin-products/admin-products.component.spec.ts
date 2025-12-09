import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminProductsComponent } from './admin-products.component';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

// Mock AdminService
class MockAdminService {
  getAllProducts() { return of([]); }
  createProduct(data: any) { return of({ id: 1, ...data }); }
  deleteProduct(id: number) { return of({}); }
}

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AdminService, useClass: MockAdminService },
        ProductService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    fixture.detectChanges();
    
    // Limpar localStorage
    localStorage.clear();
    // Spy em window.alert
    spyOn(window, 'alert').and.stub();
    // Spy em console.error para não poluir o log
    spyOn(console, 'error').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      component.productForm.reset();
      expect(component.productForm.valid).toBeFalsy();
    });

    it('should be valid when all required fields are filled correctly', () => {
      component.productForm.patchValue({
        nome: 'Produto Teste',
        descricao: 'Descrição Teste',
        preco: 10,
        estoque: 5,
        categoria_id: 1
      });
      expect(component.productForm.valid).toBeTruthy();
    });

    it('should be invalid with negative price', () => {
      component.productForm.patchValue({
        nome: 'Teste',
        descricao: 'Desc',
        preco: -5,
        estoque: 10,
        categoria_id: 1
      });
      expect(component.productForm.valid).toBeFalsy();
    });
  });

  describe('Product Operations', () => {
    beforeEach(() => {
      // Preencher formulário válido
      component.productForm.patchValue({
        nome: 'Produto Local',
        descricao: 'Desc',
        preco: 100,
        estoque: 10,
        categoria_id: 1
      });
    });

    it('should create a new local product successfully', async () => {
      await component.onSubmit();

      const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].nome).toBe('Produto Local');
      expect(stored[0].isLocal).toBeTrue();
      expect(window.alert).toHaveBeenCalledWith('Produto cadastrado localmente com sucesso!');
    });

    it('should handle editing a static product by creating a local copy', async () => {
      // Setup: Mock existing static product in editing mode
      const staticId = 1;
      component.editingId = staticId;
      
      // Mock products signal to return the static product
      productService.products.set([{ id: 1, name: 'Static', price: 50, image: 'img.png' } as any]);

      await component.onSubmit();

      const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].originalId).toBe(staticId);
      expect(stored[0].id).toMatch(/^local-/); // Should have a new local ID
      expect(window.alert).toHaveBeenCalledWith('Produto estático editado salvo como nova cópia local.');
    });

    it('should update an existing local product', async () => {
      // Setup: Create a local product first
      const localId = 'local-123';
      const initialProduct = {
        id: localId,
        nome: 'Original',
        preco: 50,
        isLocal: true
      };
      localStorage.setItem('local_products', JSON.stringify([initialProduct]));

      // Enter edit mode
      component.editingId = localId;
      component.productForm.patchValue({ nome: 'Updated Name' });

      await component.onSubmit();

      const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(localId);
      expect(stored[0].nome).toBe('Updated Name');
      expect(window.alert).toHaveBeenCalledWith('Produto atualizado com sucesso!');
    });

    it('should delete a local product', () => {
      const localProduct = { id: 'local-123', nome: 'To Delete', isLocal: true };
      localStorage.setItem('local_products', JSON.stringify([localProduct]));
      
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteProduct('local-123');

      const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
      expect(stored.length).toBe(0);
      expect(window.alert).toHaveBeenCalledWith('Produto local removido com sucesso!');
    });
  });

  describe('Robustness & Error Handling', () => {
    it('should handle QuotaExceededError gracefully', async () => {
      component.productForm.patchValue({
        nome: 'Heavy Product',
        descricao: 'Desc',
        preco: 100,
        estoque: 10,
        categoria_id: 1
      });

      // Mock localStorage.setItem to throw error
      spyOn(localStorage, 'setItem').and.throwError(
        new DOMException('QuotaExceededError', 'QuotaExceededError')
      );

      await component.onSubmit();

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Erro ao salvar dados/));
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle file reading errors', async () => {
      // Mock toBase64 to throw error
      spyOn<any>(component, 'toBase64').and.returnValue(Promise.reject('File read error'));
      
      // Simulate file selection
      component.selectedFile = new File([''], 'test.png', { type: 'image/png' });
      
      component.productForm.patchValue({
        nome: 'File Error Product',
        descricao: 'Desc',
        preco: 100,
        estoque: 10,
        categoria_id: 1
      });

      await component.onSubmit();

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Erro ao processar o produto/));
    });
  });
});
