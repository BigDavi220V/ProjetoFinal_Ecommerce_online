import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProductsComponent } from './admin-products.component';
import { AdminService } from '../../../services/admin.service';
import { of } from 'rxjs';

// Mock AdminService
class MockAdminService {
  getAllProducts() {
    return of([]);
  }
  createProduct(data: any) {
    return of({ id: 1, ...data });
  }
  deleteProduct(id: number) {
    return of({});
  }
  uploadGallery(id: number, data: any) {
    return of({});
  }
}

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent],
      providers: [
        { provide: AdminService, useClass: MockAdminService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    component.productForm.reset();
    expect(component.productForm.valid).toBeFalsy();
  });

  it('form should be valid when all required fields are filled', () => {
    component.productForm.controls['nome'].setValue('Produto Teste');
    component.productForm.controls['descricao'].setValue('Descrição Teste');
    component.productForm.controls['preco'].setValue(10);
    component.productForm.controls['estoque'].setValue(5);
    component.productForm.controls['categoria_id'].setValue(1);
    
    expect(component.productForm.valid).toBeTruthy();
  });

  it('should save product to localStorage when submitting', async () => {
    component.productForm.controls['nome'].setValue('Produto Local');
    component.productForm.controls['descricao'].setValue('Desc');
    component.productForm.controls['preco'].setValue(100);
    component.productForm.controls['estoque'].setValue(10);
    component.productForm.controls['categoria_id'].setValue(1);

    await component.onSubmit();

    const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].nome).toBe('Produto Local');
    expect(stored[0].isLocal).toBeTrue();
  });

  it('should load products from localStorage', () => {
    const localProduct = { id: 'local-1', nome: 'Local Item', isLocal: true };
    localStorage.setItem('local_products', JSON.stringify([localProduct]));

    component.loadProducts();
    
    // products é um signal
    const products = component.products();
    expect(products.some(p => p.id === 'local-1')).toBeTrue();
  });

  it('should delete local product from localStorage', () => {
    const localProduct = { id: 'local-123', nome: 'To Delete', isLocal: true };
    localStorage.setItem('local_products', JSON.stringify([localProduct]));
    
    // Mock confirm
    spyOn(window, 'confirm').and.returnValue(true);
    // Mock alert
    spyOn(window, 'alert').and.stub();

    component.deleteProduct('local-123');

    const stored = JSON.parse(localStorage.getItem('local_products') || '[]');
    expect(stored.length).toBe(0);
  });
});
