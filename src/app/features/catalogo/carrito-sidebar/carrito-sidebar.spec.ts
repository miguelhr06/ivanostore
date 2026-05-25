import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarritoSidebarComponent } from './carrito-sidebar';

describe('CarritoSidebar', () => {
  let component: CarritoSidebarComponent;
  let fixture: ComponentFixture<CarritoSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarritoSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
