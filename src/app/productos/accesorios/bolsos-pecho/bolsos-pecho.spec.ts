import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolsosPechoComponent } from './bolsos-pecho';

describe('BolsosPecho', () => {
  let component: BolsosPechoComponent;
  let fixture: ComponentFixture<BolsosPechoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BolsosPechoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BolsosPechoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
