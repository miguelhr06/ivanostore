import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesoriosComponent } from './accesorios';

describe('Accesorios', () => {
  let component: AccesoriosComponent;
  let fixture: ComponentFixture<AccesoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccesoriosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccesoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
