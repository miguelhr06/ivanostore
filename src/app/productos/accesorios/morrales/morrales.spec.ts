import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorralesComponent } from './morrales';

describe('Morrales', () => {
  let component: MorralesComponent;
  let fixture: ComponentFixture<MorralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MorralesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MorralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
