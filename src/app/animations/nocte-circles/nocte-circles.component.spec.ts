import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NocteCirclesV2Component } from './nocte-circles-v2.component';

describe('NocteCirclesV2Component', () => {
  let component: NocteCirclesV2Component;
  let fixture: ComponentFixture<NocteCirclesV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NocteCirclesV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NocteCirclesV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
