import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicasFooter } from './dinamicas-footer';

describe('DinamicasFooter', () => {
  let component: DinamicasFooter;
  let fixture: ComponentFixture<DinamicasFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DinamicasFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(DinamicasFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
