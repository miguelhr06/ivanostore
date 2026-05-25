import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrandeComponent } from './grande';

describe('GrandeComponent', () => {
  let component: GrandeComponent;
  let fixture: ComponentFixture<GrandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrandeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GrandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
