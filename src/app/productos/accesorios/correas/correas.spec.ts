import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreasComponent } from './correas';

describe('Correas', () => {
  let component: CorreasComponent;
  let fixture: ComponentFixture<CorreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorreasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CorreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
