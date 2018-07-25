import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsControlbarComponent } from './vs-controlbar.component';

describe('VsControlbarComponent', () => {
  let component: VsControlbarComponent;
  let fixture: ComponentFixture<VsControlbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsControlbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsControlbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
