import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsMainComponent } from './vs-main.component';

describe('VsMainComponent', () => {
  let component: VsMainComponent;
  let fixture: ComponentFixture<VsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
