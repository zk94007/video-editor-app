import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsToolbarComponent } from './vs-toolbar.component';

describe('VsToolbarComponent', () => {
  let component: VsToolbarComponent;
  let fixture: ComponentFixture<VsToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
