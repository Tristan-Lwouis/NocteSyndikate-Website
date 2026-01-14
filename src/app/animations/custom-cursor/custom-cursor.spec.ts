import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCursor } from './custom-cursor';

describe('CustomCursor', () => {
  let component: CustomCursor;
  let fixture: ComponentFixture<CustomCursor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCursor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomCursor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
