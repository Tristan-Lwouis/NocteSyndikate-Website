import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Circles } from './circles';

describe('Circles', () => {
  let component: Circles;
  let fixture: ComponentFixture<Circles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Circles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Circles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
