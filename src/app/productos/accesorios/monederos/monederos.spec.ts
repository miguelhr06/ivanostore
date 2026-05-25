import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonederosComponent } from './monederos';

describe('Monederos', () => {
  let component: MonederosComponent;
  let fixture: ComponentFixture<MonederosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MonederosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MonederosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
