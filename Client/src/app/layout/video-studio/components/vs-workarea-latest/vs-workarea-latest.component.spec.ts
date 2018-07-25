import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsWorkareaLatestComponent } from './vs-workarea-latest.component';

describe('VsWorkareaLatestComponent', () => {
  let component: VsWorkareaLatestComponent;
  let fixture: ComponentFixture<VsWorkareaLatestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsWorkareaLatestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsWorkareaLatestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
