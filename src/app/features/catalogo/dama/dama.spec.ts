import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamaComponent } from './dama';

describe('Dama', () => {
  let component: DamaComponent;
  let fixture: ComponentFixture<DamaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DamaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DamaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
