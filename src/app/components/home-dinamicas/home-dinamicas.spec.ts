import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDinamicas } from './home-dinamicas';

describe('HomeDinamicas', () => {
  let component: HomeDinamicas;
  let fixture: ComponentFixture<HomeDinamicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeDinamicas],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeDinamicas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
