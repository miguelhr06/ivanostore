import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilleterasComponent } from './billeteras';

describe('Billeteras', () => {
  let component: BilleterasComponent;
  let fixture: ComponentFixture<BilleterasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BilleterasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BilleterasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
