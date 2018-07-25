import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsRepositionComponent } from './vs-reposition.component';

describe('VsRepositionComponent', () => {
  let component: VsRepositionComponent;
  let fixture: ComponentFixture<VsRepositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsRepositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsRepositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
