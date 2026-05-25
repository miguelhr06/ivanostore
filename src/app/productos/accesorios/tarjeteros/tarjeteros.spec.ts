import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjeterosComponent } from './tarjeteros';

describe('TarjeterosComponent', () => {
  let component: TarjeterosComponent;
  let fixture: ComponentFixture<TarjeterosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TarjeterosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjeterosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
