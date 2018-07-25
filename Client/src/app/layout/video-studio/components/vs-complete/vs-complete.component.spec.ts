import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsCompleteComponent } from './vs-complete.component';

describe('VsCompleteComponent', () => {
  let component: VsCompleteComponent;
  let fixture: ComponentFixture<VsCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
