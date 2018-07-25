import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VsSidebarPanelComponent } from './vs-sidebar-panel.component';

describe('VsSidebarPanelComponent', () => {
  let component: VsSidebarPanelComponent;
  let fixture: ComponentFixture<VsSidebarPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VsSidebarPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VsSidebarPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
