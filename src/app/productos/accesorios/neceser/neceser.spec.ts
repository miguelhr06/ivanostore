import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NecesersComponent } from './neceser';

describe('Neceser', () => {
  let component: NecesersComponent;
  let fixture: ComponentFixture<NecesersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NecesersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NecesersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
