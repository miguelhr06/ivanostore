import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibroReclamacionesComponent } from './libro-reclamaciones';

describe('LibroReclamaciones', () => {
  let component: LibroReclamacionesComponent;
  let fixture: ComponentFixture<LibroReclamacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroReclamacionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroReclamacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
