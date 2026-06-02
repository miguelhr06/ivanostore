import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedianoComponent } from './mediano';

describe('Mediano', () => {
  let component: MedianoComponent;
  let fixture: ComponentFixture<MedianoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedianoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedianoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

