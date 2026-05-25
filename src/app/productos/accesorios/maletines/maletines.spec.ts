import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaletinesComponent } from './maletines';

describe('Maletines', () => {
  let component: MaletinesComponent;
  let fixture: ComponentFixture<MaletinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaletinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MaletinesComponent)
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
