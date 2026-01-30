import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NocteCirclesComponent } from './nocte-circles.component';

describe('NocteCirclesComponent', () => {
  let component: NocteCirclesComponent;
  let fixture: ComponentFixture<NocteCirclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NocteCirclesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NocteCirclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
