import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CadastroComponent } from './cadastro.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

describe('CadastroComponent', () => {
  let component: CadastroComponent;
  let fixture: ComponentFixture<CadastroComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', ['cadastrar']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CadastroComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: rSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have submit button disabled initially', () => {
    const button = fixture.debugElement.query(By.css('.btn-cadastro')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should keep button disabled if required fields are empty', () => {
    component.signupForm.controls['nome'].setValue('');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.btn-cadastro')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should keep button disabled if checkbox (lgpd) is unchecked', () => {
    // Fill all fields correctly
    component.signupForm.controls['nome'].setValue('Test User');
    component.signupForm.controls['email'].setValue('test@example.com');
    component.signupForm.controls['senha'].setValue('password123');
    component.signupForm.controls['confirmarSenha'].setValue('password123');
    component.signupForm.controls['cpf'].setValue('12345678901');
    component.signupForm.controls['bairro'].setValue('Test Bairro');
    component.signupForm.controls['rua'].setValue('Test Rua');
    component.signupForm.controls['numero'].setValue('123');
    component.signupForm.controls['cidade'].setValue('Test City');
    component.signupForm.controls['uf'].setValue('SP');
    
    // Checkbox explicitly false
    component.signupForm.controls['lgpd'].setValue(false);
    
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.btn-cadastro')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should enable button when all fields are valid and checkbox is checked', () => {
    component.signupForm.controls['nome'].setValue('Test User');
    component.signupForm.controls['email'].setValue('test@example.com');
    component.signupForm.controls['senha'].setValue('password123');
    component.signupForm.controls['confirmarSenha'].setValue('password123');
    component.signupForm.controls['cpf'].setValue('12345678901');
    component.signupForm.controls['bairro'].setValue('Test Bairro');
    component.signupForm.controls['rua'].setValue('Test Rua');
    component.signupForm.controls['numero'].setValue('123');
    component.signupForm.controls['cidade'].setValue('Test City');
    component.signupForm.controls['uf'].setValue('SP');
    component.signupForm.controls['lgpd'].setValue(true);

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.btn-cadastro')).nativeElement;
    expect(button.disabled).toBeFalse();
  });

  it('should disable button if passwords do not match', () => {
    component.signupForm.controls['nome'].setValue('Test User');
    component.signupForm.controls['email'].setValue('test@example.com');
    component.signupForm.controls['senha'].setValue('password123');
    component.signupForm.controls['confirmarSenha'].setValue('password456'); // Mismatch
    component.signupForm.controls['cpf'].setValue('12345678901');
    component.signupForm.controls['bairro'].setValue('Test Bairro');
    component.signupForm.controls['rua'].setValue('Test Rua');
    component.signupForm.controls['numero'].setValue('123');
    component.signupForm.controls['cidade'].setValue('Test City');
    component.signupForm.controls['uf'].setValue('SP');
    component.signupForm.controls['lgpd'].setValue(true);

    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.btn-cadastro')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should call userService.cadastrar when form is valid and submitted', () => {
    userServiceSpy.cadastrar.and.returnValue(of({ message: 'Success' }));
    
    component.signupForm.setValue({
      nome: 'Test User',
      email: 'test@example.com',
      telefone: '11999999999',
      senha: 'password123',
      confirmarSenha: 'password123',
      cpf: '12345678901',
      bairro: 'Test Bairro',
      rua: 'Test Rua',
      numero: '123',
      cidade: 'Test City',
      uf: 'SP',
      lgpd: true
    });

    component.onSubmit();
    
    expect(userServiceSpy.cadastrar).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
