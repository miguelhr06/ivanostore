import { TestBed } from '@angular/core/testing';

import { Direcciones } from './direcciones';

describe('Direcciones', () => {
  let service: Direcciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Direcciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
