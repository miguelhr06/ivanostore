import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PequenoComponent } from './pequeno';

describe('Pequeno', () => {
  let component: PequenoComponent;
  let fixture: ComponentFixture<PequenoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PequenoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PequenoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
