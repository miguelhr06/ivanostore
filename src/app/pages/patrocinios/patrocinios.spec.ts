import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Patrocinios } from './patrocinios';

describe('Patrocinios', () => {
  let component: Patrocinios;
  let fixture: ComponentFixture<Patrocinios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Patrocinios],
    }).compileComponents();

    fixture = TestBed.createComponent(Patrocinios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
