import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedefinirPasswordComponent } from './redefinir-password.component';

describe('RedefinirPasswordComponent', () => {
  let component: RedefinirPasswordComponent;
  let fixture: ComponentFixture<RedefinirPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedefinirPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedefinirPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
