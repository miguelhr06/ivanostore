import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CangurosComponent } from './canguros';

describe('Canguros', () => {
  let component: CangurosComponent;
  let fixture: ComponentFixture<CangurosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CangurosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CangurosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
