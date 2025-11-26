import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesDoProdutoComponent } from './detalhes-do-produto.component';

describe('DetalhesDoProdutoComponent', () => {
  let component: DetalhesDoProdutoComponent;
  let fixture: ComponentFixture<DetalhesDoProdutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesDoProdutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhesDoProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
