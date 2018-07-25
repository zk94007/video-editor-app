import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsWorkspaceComponent } from './vs-workspace.component';

describe('VsWorkspaceComponent', () => {
  let component: VsWorkspaceComponent;
  let fixture: ComponentFixture<VsWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
