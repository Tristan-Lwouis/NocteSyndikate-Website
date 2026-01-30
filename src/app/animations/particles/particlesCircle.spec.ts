import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Particles } from './particlesCircle';

describe('Particles', () => {
  let component: Particles;
  let fixture: ComponentFixture<Particles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Particles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Particles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
