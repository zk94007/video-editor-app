import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsFramelineComponent } from './vs-frameline.component';

describe('VsFramelineComponent', () => {
  let component: VsFramelineComponent;
  let fixture: ComponentFixture<VsFramelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsFramelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsFramelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
