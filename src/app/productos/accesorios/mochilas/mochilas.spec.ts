import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MochilasComponent } from './mochilas';

describe('Mochilas', () => {
  let component: MochilasComponent;
  let fixture: ComponentFixture<MochilasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MochilasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MochilasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
