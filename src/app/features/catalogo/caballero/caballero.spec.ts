import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaballeroComponent } from './caballero';

describe('Caballero', () => {
  let component: CaballeroComponent;
  let fixture: ComponentFixture<CaballeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaballeroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CaballeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
