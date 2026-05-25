import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisMensajes } from './mis-mensajes';

describe('MisMensajes', () => {
  let component: MisMensajes;
  let fixture: ComponentFixture<MisMensajes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisMensajes],
    }).compileComponents();

    fixture = TestBed.createComponent(MisMensajes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
